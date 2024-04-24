import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import NotFound from "./utils/NotFound";
import Login from "./user/LoggingIn";
import Status from "./question/Questions";
import Register from "./user/Register";
import UserPage from "./user/UserPage";
import NewQuestion from "./question/NewQuestion";
import SingleQuestionPage from "./question/SingleQuestionPage";
import EditQuestion from "./question/EditQuestion";

export default function ContentRouter() {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-slate-100 min-h-screen">
      <Routes>
        <Route path="/" element={<Navigate to="/questions" replace={true} />} />
        <Route path="/login" element={<Login navigate={navigate} />} />
        <Route path="/register" element={<Register navigate={navigate} />} />
        <Route path="/questions" element={<Status />} />
        <Route
          path="/questions/new"
          element={<NewQuestion navigate={navigate} />}
        />
        <Route
          path="/questions/:id"
          element={<SingleQuestionPage navigate={navigate} />}
        />
        <Route
          path="/questions/:id/edit"
          element={<EditQuestion navigate={navigate} />}
        />
        <Route path="/users/:username" element={<UserPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
