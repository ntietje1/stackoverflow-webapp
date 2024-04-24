import { Link, NavigateFunction } from "react-router-dom";
import { Comment } from "../../types/Comment";
import { useEffect, useState } from "react";
import DefaultButton from "../utils/DefaultButton";
import axios from "axios";
import { API_URL } from "../../server_url";

export default function CommentCard({
  comment,
  csrf,
  user,
  navigate,
  role,
}: {
  comment: Comment;
  csrf: string;
  user: string | string[] | null | undefined;
  role: string | string[] | null | undefined;
  navigate: NavigateFunction;
}) {
  const handleVote = (vote: "up" | "down") => {
    axios
      .put(
        `${API_URL}/comments/${comment._id}/${vote}`,
        {},
        {
          headers: {
            "X-CSRF-Token": csrf,
          },
          withCredentials: true,
        }
      )
      .catch(() => {
        alert("Error updating comment with vote.");
      });
    navigate(0);
  };

  const handleEdit = () => {
    if (editing) {
      axios
        .put(
          `${API_URL}/comments/${comment._id}`,
          { text: title },
          {
            headers: {
              "X-CSRF-Token": csrf,
            },
            withCredentials: true,
          }
        )
        .then(() => navigate(0))
        .catch(() => {
          alert("Error updating comment.");
        });
    }
    setEditing(!editing);
  };
  
  const handleRemove = () => {
    axios
      .put(
        `${API_URL}/comments/${comment._id}`,
        { hidden: true },
        {
          headers: {
            "X-CSRF-Token": csrf,
          },
          withCredentials: true,
        }
      )
      .then(() => navigate(0))
      .catch(() => {
        alert("Error updating comment.");
      });
  };

  const [userVote, setUserVote] = useState<"" | "up" | "down">("");

  const checkVote = () => {
    axios
      .get(`${API_URL}/comments/${comment._id}/check-vote`, {
        headers: {
          "X-CSRF-Token": csrf,
        },
        withCredentials: true,
      })
      .then((res) => setUserVote(res.data))
      .catch(() => {
        //alert("Error getting comment vote.");
      });
  };

  useEffect(() => {
    checkVote();
  }, []);

  const [editing, setEditing] = useState<boolean>(false);
  const [title, setTitle] = useState(comment.text);

  return (
    <div className="my-8 comment-card">
      <Link
        to={`/users/${comment.username}`}
        className=" hover:underline text-cyan-600"
      >
        @{comment.username}
      </Link>
      <p className="text-slate-500">
        {new Date(comment.post_date_time).toLocaleString()}
      </p>
      {editing ? (
        <div>
          <input
            className="w-full my-2 ring-1 ring-slate-200"
            type="text"
            id="edit-content"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
      ) : (
        <p className="my-2 p-2 bg-slate-50 rounded-md">{comment.text}</p>
      )}
      <div className="flex flex-row gap-4 items-center">
        {user !== "" && (
          <>
            <button
              onClick={() => handleVote("up")}
              className={`focus:outline-none ${
                userVote === "up"
                  ? "bg-orange-500 hover:bg-orange-600"
                  : "hover:bg-orange-000"
              } up-vote`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-6 w-6 text-gray-800"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </button>
          </>
        )}
        <button className="w-10 hover:bg-slate-200 cursor-default">
          {comment.votes}
        </button>
        {user !== "" && (
          <>
            <button
              onClick={() => handleVote("down")}
              className={`focus:outline-none ${
                userVote === "down"
                  ? "bg-blue-700 hover:bg-blue-800"
                  : "hover:bg-blue-000"
              } down-vote`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-6 w-6 text-gray-800"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </>
        )}

        {user === comment.username && (
          <DefaultButton
            className="bg-yellow-600"
            text={!editing ? "Edit" : "Save"}
            onClick={handleEdit}
          />
        )}
        {(user === comment.username || role === "admin") && (
          <DefaultButton
            className="bg-rose-700"
            text="Remove"
            onClick={handleRemove}
          />
        )}
      </div>
    </div>
  );
}
