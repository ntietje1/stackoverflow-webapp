import { Comment } from "./Comment";

class Question {
  title: string;
  description: string;
  post_date_time: string;
  posted_by: string;
  _id: string;
  comments: Comment[];
  tags: string[];
  votes: number;
  userVote: string;

  constructor(
    title: string,
    description: string,
    _id: string,
    post_date_time: string,
    posted_by: string,
    comments: Comment[],
    tags: string[],
    votes: number,
    userVote: string
  ) {
    this.title = title;
    this.description = description;
    this._id = _id;
    this.posted_by = posted_by;
    this.comments = comments;
    this.post_date_time = post_date_time;
    this.votes = votes;
    this.tags = tags;
    this.userVote = userVote;
    // if (userVote)  {
    //   this.userVote = userVote;
    // } else {
    //   this.userVote = "none";
    // }
  }
}

export default Question;
