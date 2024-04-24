import { useEffect, useState } from "react";
import PageWrapper from "../utils/PageWrapper";
import DefaultButton from "../utils/DefaultButton";
import { API_URL } from "../../server_url";
import { NavigateFunction, useParams } from "react-router";
import { useCsrf } from "../../utils/useCsrf";
import Capsule from "../utils/Capsule";
import axios from "axios";
import { useUser } from "../../utils/useUser";

export default function EditQuestion({
  navigate,
}: {
  navigate: NavigateFunction;
}) {
  const csrf = useCsrf();
  const { id } = useParams();
  const [user] = useUser(csrf);

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [nextTag, setNextTag] = useState<string>("");

  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchQuestion();
  }, []);

  async function fetchQuestion() {
    axios
      .get(`${API_URL}/questions/${id}`, {
        headers: {
          "X-CSRF-Token": csrf,
        },
        withCredentials: true,
      })
      .then((res) => {
        setTitle(res.data.title ?? "");
        setDescription(res.data.description ?? "");
        setTags(res.data.tags ?? []);
      })
      .catch(() => {
        setError(`Error getting question.`);
      });
  }

  const updateQuestion = async () => {
    axios
      .put(
        `${API_URL}/questions/${id}`,
        { title: title, description: description, tags: tags },
        {
          headers: {
            "X-CSRF-Token": csrf,
          },
          withCredentials: true,
        }
      )
      .then((res) => {
        if (res.data._id) {
          navigate(`/questions/${res.data._id}`);
        } else {
          setError("Error redirecting after post.");
        }
      })
      .catch(() => {
        setError(`Error updating question`);
      });
  };

  return (
    <PageWrapper user={user} csrf={csrf} title={"Editing"}>
      <div className="px-10 m-10 max-w-prose w-full mx-auto flex flex-col gap-4 justify-center items-start">
        <div className="flex flex-col gap-2 w-full">
          <label
            htmlFor="title"
            className="font-mono font-semibold text-cyan-700"
          >
            Title
          </label>
          <input
            id="title"
            placeholder="What do you need help with?"
            className="rounded-md shadow-sm p-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <label
            htmlFor="description"
            className="font-mono font-semibold text-cyan-700"
          >
            Description
          </label>
          <textarea
            id="description"
            placeholder="Share more about the issue you are facing..."
            rows={7}
            className="rounded-md shadow-sm p-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <label
            htmlFor="tag-name"
            className="font-mono font-semibold text-cyan-700"
          >
            Tags
          </label>
          <div className="flex flex-row gap-4 w-full">
            <input
              id="tag-name"
              placeholder="Tag name..."
              className="rounded-md shadow-sm p-2 max-w-64"
              value={nextTag}
              onChange={(e) => setNextTag(e.target.value.toLowerCase())}
            />
            <DefaultButton
              text="Add Tag"
              id="add-tag"
              onClick={() => {
                if (tags.includes(nextTag)) {
                  setError("Tag already included.");
                } else if (nextTag === "") {
                  setError("Tag cannot be empty.");
                } else {
                  setTags([...tags, nextTag]);
                  setNextTag("");
                  setError("");
                }
              }}
            />
          </div>
          <div className="flex flex-wrap gap-2 w-full mt-2">
            {tags.map((tag) => (
              <div
                key={tag}
                onClick={() => setTags(tags.filter((t) => tag !== t))}
                className="relative"
              >
                <Capsule text={tag.toLowerCase()} />
                <div className="cursor-pointer absolute left-0 top-0 bottom-0 right-0 flex justify-center items-center w-full">
                  ❌
                </div>
              </div>
            ))}
          </div>

          <p className="font-mono my-4 text-rose-600">
            {error !== "" && error}
          </p>
        </div>
        <DefaultButton
          onClick={updateQuestion}
          className="mx-auto my-4"
          text="Submit Changes"
        />
      </div>
    </PageWrapper>
  );
}
