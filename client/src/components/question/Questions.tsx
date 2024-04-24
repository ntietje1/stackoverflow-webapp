import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useCsrf } from "../../utils/useCsrf";
import { useUser } from "../../utils/useUser";
import { useEffect, useState } from "react";
import Question from "../../types/Question";
import axios from "axios";
import { API_URL } from "../../server_url";
import QuestionCardView from "./QuestionCardView";
import PageWrapper from "../utils/PageWrapper";
import DefaultButton from "../utils/DefaultButton";
import SearchForm from "../utils/SearchForm";

export default function Questions() {
  const csrfToken = useCsrf();
  const [user, role] = useUser(csrfToken);

  const [searchParams] = useSearchParams();

  const [questions, setQuestions] = useState<Question[]>([]);

  const loc = useLocation();

  useEffect(() => {
    if (loc.state && loc.state.needReload) {
      navigate(".", { replace: true });
      location.reload();
    }
  }, [loc]);

  useEffect(() => {
    const title = searchParams.get("title");
    const description = searchParams.get("description");
    const tags = searchParams.get("tags");
    const early = searchParams.get("early");
    const late = searchParams.get("late");
    const order = searchParams.get("order");

    axios
      .get(`${API_URL}/questions`, {
        headers: {
          "X-CSRF-Token": csrfToken,
        },
        params: {
          ...(title !== "" && { title: title }),
          ...(description !== "" && { description: description }),
          ...(tags !== "" && { tags: tags }),
          ...(early !== "" && { early: early }),
          ...(late !== "" && { late: late }),
          order: order ?? "newest",
        },
        withCredentials: true,
      })
      .then((res) => setQuestions(res.data))
      .catch(() => {
        setError(`Error fetching the questions`);
      });
  }, [searchParams]);

  const navigate = useNavigate();
  const [error, setError] = useState<string>("");

  return (
    <PageWrapper user={user} title={"Questions"} csrf={csrfToken}>
      <div className="flex flex-row justify-between p-4">
        <SearchForm navigate={navigate} />

        {user !== "" && (
          <DefaultButton
            className="h-fit"
            onClick={() => navigate("/questions/new", { replace: true })}
            text={"Ask a question"}
          />
        )}
      </div>

      <div className="flex flex-col p-4 gap-4 max-w-prose w-full mx-auto">
        {questions.length === 0 ? (
          <p className="font-mono m-auto text-cyan-600">No questions found.</p>
        ) : (
          questions.map((q) => (
            <QuestionCardView
              key={q._id}
              question={q}
              csrf={csrfToken}
              user={user}
              role={role}
            />
          ))
        )}
      </div>

      <p className="font-mono my-4 text-rose-600">{error !== "" && error}</p>
    </PageWrapper>
  );
}
