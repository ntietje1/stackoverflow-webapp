import { useEffect, useState } from "react";
import { Link, NavigateFunction, useParams } from "react-router-dom";
import Question from "../../types/Question";
import CommentCard from "../comment/CommentCard";
import DefaultButton from "../utils/DefaultButton";
import { API_URL } from "../../server_url";
import { useCsrf } from "../../utils/useCsrf";
import axios from "axios";
import PageWrapper from "../utils/PageWrapper";
import { useUser } from "../../utils/useUser";
import QuestionCardView from "./QuestionCardView";

export default function SingleQuestionPage({
  navigate,
}: {
  navigate: NavigateFunction;
}) {
  const { id } = useParams();

  const csrf = useCsrf();
  const [user, role] = useUser(csrf);

  const [question, setQuestion] = useState<Question | null>(null);
  const [comment, setComment] = useState<string>("");

  const [error, setError] = useState<string>("");

  async function fetchQuestion() {
    axios
      .get(`${API_URL}/questions/${id}`, {
        headers: {
          "X-CSRF-Token": csrf,
        },
        withCredentials: true,
      })
      .then((res) => {
        setQuestion(res.data);
      })
      .catch(() => {
        setError(`Error getting questions.`);
      });
  }

  const postComment = () => {
    axios
      .post(
        `${API_URL}/comments`,
        { qid: question?._id ?? "", text: comment },
        {
          headers: {
            "X-CSRF-Token": csrf,
          },
          withCredentials: true,
        }
      )
      .then(() => navigate(0))
      .catch(() => {
        setError(`Error posting comment`);
      });
  };

  useEffect(() => {
    fetchQuestion();
  }, [id]);

  return (
    <PageWrapper user={user} title={question?.title ?? ""} csrf={csrf}>
      <div className="p-10 px-8 w-full max-w-prose mx-auto">
        <p className="font-mono my-4 text-rose-600">{error !== "" && error}</p>
        {question && (
          <>
            <QuestionCardView
              question={question}
              csrf={csrf}
              user={user}
              role={role}
            />
            <hr className="w-full h-1 mx-auto bg-slate-300 rounded my-10" />
            {question.comments &&
              question.comments.map((c) => (
                <CommentCard
                  key={c._id}
                  comment={c}
                  csrf={csrf}
                  user={user}
                  role={role}
                  navigate={navigate}
                />
              ))}
            {user === "" ? (
              <>
                <Link className="link" to="/login">
                  Sign in
                </Link>{" "}
                to post answers.
              </>
            ) : (
              <>
                <textarea
                  id="comment-input"
                  onChange={(e) => setComment(e.target.value)}
                  value={comment}
                  className="w-full mb-2 p-2 rounded-md shadow-sm"
                  placeholder="Add your answer ..."
                ></textarea>
                <DefaultButton
                  onClick={postComment}
                  className="mb-20"
                  text="Post Answer"
                />
              </>
            )}
          </>
        )}
      </div>
    </PageWrapper>
  );
}
