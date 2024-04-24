import axios from "axios";
import Question from "../../types/Question";
import CardView from "../utils/CardView";
import VoteButtons from "../utils/VoteButtons";
import { API_URL } from "../../server_url";
import { Link, useNavigate } from "react-router-dom";
import Capsule from "../utils/Capsule";
import DefaultButton from "../utils/DefaultButton";

export default function QuestionCardView({
  question,
  csrf,
  user,
  role,
}: {
  question: Question;
  csrf: string;
  user: string | string[] | null | undefined;
  role: string | string[] | null | undefined;
}) {
  const navigate = useNavigate();

  const handleBan = () => {
    axios
      .put(
        `${API_URL}/questions/${question._id}`,
        { hidden: true },
        {
          headers: {
            "X-CSRF-Token": csrf,
          },
          withCredentials: true,
        }
      )
      .then(() =>
        navigate("/questions", { replace: true, state: { needReload: true } })
      )
      .catch(() => alert("Could not remove question."));
  };

  const vote = async (voteType: string) => {
    axios
      .put(
        `${API_URL}/questions/${question._id}/vote`,
        { vote: voteType },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrf,
          },
        }
      )
      .catch(() => {
        alert(`Error posting question.`);
      });

    location.reload();
  };

  return (
    <CardView
      className="question-card"
      title={question.title}
      note={
        <Link className="hover:underline" to={`/users/${question.posted_by}`}>
          @{question.posted_by}
        </Link>
      }
      destination={"/questions/" + question._id}
      sidechildren={
        <div className="flex flex-row gap-4">
          <div className="flex flex-col gap-2 items-center justify-center">
            {user === question.posted_by && (
              <DefaultButton
                onClick={() => navigate(`/questions/${question._id}/edit`)}
                className="bg-yellow-600 w-full"
                text={"Edit"}
              />
            )}
            {(user === question.posted_by || role === "admin") && (
              <DefaultButton
                onClick={handleBan}
                className="bg-rose-700 w-full"
                text={"Remove"}
              />
            )}
          </div>
          <VoteButtons
            votes={question.votes}
            userVote={question.userVote}
            onUpvote={() => vote("up")}
            onDownvote={() => vote("down")}
            user={user}
          />
        </div>
      }
    >
      <p className="mt-1 text-slate-500">
        {new Date(question.post_date_time).toLocaleString()}
      </p>
      {
        <div className="flex flex-wrap gap-2 w-full mt-2">
          {question.tags.map((tag) => (
            <Capsule key={tag} text={tag.toLowerCase()} />
          ))}
        </div>
      }

      <p className="line-clamp-2">{question.description}</p>
    </CardView>
  );
}
