import Question from "./Question";
import { Comment } from "./Comment";

type User = {
  comments: Comment[];
  downvoted_comments: Comment[];
  downvoted_questions: Question[];
  questions: Question[];
  role: "admin" | "poster";
  upvoted_comments: Comment[];
  upvoted_questions: Question[];
  username: string;
  _id: string;
};

export type { User };
