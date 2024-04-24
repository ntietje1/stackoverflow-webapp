import { useEffect, useState } from "react";
import PageWrapper from "../utils/PageWrapper";
import DefaultButton from "../utils/DefaultButton";
import { API_URL } from "../../server_url";
import { NavigateFunction } from "react-router";
import { useCsrf } from "../../utils/useCsrf";
import Capsule from "../utils/Capsule";
import axios from "axios";
import { useUser } from "../../utils/useUser";

export default function NewQuestion({
  navigate,
}: {
  navigate: NavigateFunction;
}) {
  const csrf = useCsrf();

  const [user] = useUser(csrf);

  useEffect(() => {
    if (user === "") {
      navigate("/login", { state: { needReload: true } });
    }
  }, [user]);

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [nextTag, setNextTag] = useState<string>("");

  const [error, setError] = useState<string>("");

  const postQuestion = async () => {
    axios
      .post(
        `${API_URL}/questions`,
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
        setError(`Error posting question`);
      });
  };

  return (
    <PageWrapper user={user} csrf={csrf} title={"Ask a question"}>
      <div className="px-10 m-10 max-w-prose w-full mx-auto flex flex-col gap-4 justify-center items-start">
        <div className="flex flex-col gap-2 w-full">
          <label className="font-mono font-semibold text-cyan-700">Title</label>
          <input
            id="title"
            placeholder="What do you need help with?"
            className="rounded-md shadow-sm p-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <label className="font-mono font-semibold text-cyan-700">
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
          <label className="font-mono font-semibold text-cyan-700">Tags</label>
          <div className="flex flex-row gap-4 w-full">
            <input
              id="new-tag"
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
              <Capsule key={tag} text={tag.toLowerCase()} />
            ))}
          </div>

          <p className="font-mono my-4 text-rose-600">
            {error !== "" && error}
          </p>
        </div>
        <DefaultButton
          id="post-question"
          onClick={postQuestion}
          className="mx-auto my-4"
          text="Ask Question"
        />
      </div>
    </PageWrapper>
  );
}
