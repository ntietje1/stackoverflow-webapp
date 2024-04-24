import { useNavigate, useParams } from "react-router";
import { useCsrf } from "../../utils/useCsrf";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../server_url";
import { User } from "../../types/User";
import PageWrapper from "../utils/PageWrapper";
import QuestionCardView from "../question/QuestionCardView";
import CommentCard from "../comment/CommentCard";
import { useUser } from "../../utils/useUser";

export default function UserPage() {
  const { username } = useParams();
  const navigate = useNavigate();

  const csrf = useCsrf();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string>("");

  const [cookieUser, cookieRole] = useUser(csrf);

  useEffect(() => {
    axios
      .get(`${API_URL}/users/${username}`, {
        withCredentials: true,
        headers: {
          "X-CSRF-Token": csrf,
        },
      })
      .then((res) => {
        setUser(res.data);
      })
      .catch(() => {
        setError(`Error retrieving questions for user`);
      });
  }, [username]);

  return (
    <PageWrapper
      user={cookieUser}
      title={(user && user.username) ?? ""}
      csrf={csrf}
    >
      {user && (
        <>
          <div className="p-8">
            <h1 className="mb-2">Posted Questions</h1>
            <div className="flex gap-4 flex-wrap">
              {user.questions.map((q) => (
                <div key={q._id} className="w-96">
                  <QuestionCardView
                    question={q}
                    user={cookieUser}
                    role={cookieRole}
                    csrf={csrf}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="p-8">
            <h1 className="mb-2">Posted Comments</h1>
            <div className="flex gap-4 flex-wrap">
              {user.comments.map((q) => (
                <div key={q._id} className="w-96">
                  <CommentCard
                    user={cookieUser}
                    role={cookieRole}
                    csrf={csrf}
                    comment={q}
                    navigate={navigate}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="h-0.5 rounded-full mx-8 bg-slate-300" />
          <div className="p-8">
            <h1 className="mb-2">Upvoted Questions</h1>
            <div className="flex gap-4 flex-wrap">
              {user.upvoted_questions.map((q) => (
                <div key={q._id} className="w-96">
                  <QuestionCardView
                    question={q}
                    user={cookieUser}
                    role={cookieRole}
                    csrf={csrf}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="p-8">
            <h1 className="mb-2">Downvoted Questions</h1>
            <div className="flex gap-4 flex-wrap">
              {user.downvoted_questions.map((q) => (
                <div key={q._id} className="w-96">
                  <QuestionCardView
                    question={q}
                    user={cookieUser}
                    role={cookieRole}
                    csrf={csrf}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="h-0.5 rounded-full mx-8 bg-slate-300" />
          <div className="p-8">
            <h1 className="mb-2">Upvoted comments</h1>
            <div className="flex gap-4 flex-wrap">
              {user.upvoted_comments.map((q) => (
                <div key={q._id} className="w-96">
                  <CommentCard
                    user={cookieUser}
                    role={cookieRole}
                    csrf={csrf}
                    comment={q}
                    navigate={navigate}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="p-8">
            <h1 className="mb-2">Downvoted comments</h1>
            <div className="flex gap-4 flex-wrap">
              {user.downvoted_comments.map((q) => (
                <div key={q._id} className="w-96">
                  <CommentCard
                    user={cookieUser}
                    role={cookieRole}
                    csrf={csrf}
                    comment={q}
                    navigate={navigate}
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      <p className="font-mono my-4 text-rose-600">{error !== "" && error}</p>
    </PageWrapper>
  );
}
