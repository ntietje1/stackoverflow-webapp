const user1 = {
  _id: "uid1",
  username: "user1",
  password: "password1",
  question_ids: ["qid1", "qid2"],
  comment_ids: ["cid1"],
  upvoted_qids: ["qid1", "qid2", "qid3", "qid4"],
  downvoted_qids: [],
  upvoted_cids: ["cid1", "cid2", "cid3"],
  downvoted_cids: [],
  role: "admin",
};

const user2 = {
  _id: "uid2",
  username: "user2",
  password: "password2",
  question_ids: ["qid3"],
  comment_ids: ["cid2", "cid3"],
  upvoted_qids: [],
  downvoted_qids: ["qid1", "qid2", "qid3", "qid4"],
  upvoted_cids: [],
  downvoted_cids: ["cid1", "cid2", "cid3"],
};

const user3 = {
  _id: "uid3",
  username: "user3",
  password: "password3",
  question_ids: ["qid4"],
  comment_ids: [],
  upvoted_qids: [],
  downvoted_qids: [],
  upvoted_cids: [],
  downvoted_cids: [],
};

const tag1 = "react";
const tag2 = "javascript";
const tag3 = "android studio";

const com1 = {
  _id: "cid1",
  text: "I don't understand your question!??",
  username: user1.username,
  votes: 0,
  post_date_time: Date.parse("Feb 5, 2021"),
};

const com2 = {
  _id: "cid2",
  text: "try uninstalling!!",
  username: user2.username,
  votes: 3,
  post_date_time: Date.parse("Feb 10, 2021"),
};
const com3 = {
  _id: "cid3",
  text: "usestate",
  username: user3.username,
  votes: 2,
  post_date_time: Date.parse("Feb 4, 2021"),
};

const q1 = {
  _id: "qid1",
  title: "How do I store a value in react?",
  user_id: user1._id,
  description: "react no work",
  posted_by: user1.username,
  post_date_time: Date.parse("Jan 5, 2021"),
  votes: 0,
  tags: [tag1, tag2],
  comments: [com1, com3],
};
const q2 = {
  _id: "qid2",
  title: "Can't get android studio to work",
  user_id: user1._id,
  description: "help??!!",
  posted_by: user1.username,
  post_date_time: Date.parse("Jan 2, 2021"),
  votes: 3,
  tags: [tag3],
  comments: [com2],
};
const q3 = {
  _id: "qid3",
  title: "javascript is badddd",
  user_id: user2._id,
  description: "javascript is the worst!!!",
  posted_by: user2.username,
  post_date_time: Date.parse("Jan 3, 2021"),
  votes: 2,
  tags: [tag1],
  comments: [],
};
const q4 = {
  _id: "qid4",
  title: "android studio help please",
  user_id: user3._id,
  description: "android studio help???",
  posted_by: user3.username,
  post_date_time: Date.parse("Jan 4, 2021"),
  votes: 1,
  tags: [tag3],
  comments: [],
};

module.exports = {
  user1,
  user2,
  user3,
  tag1,
  tag2,
  tag3,
  com1,
  com2,
  com3,
  q1,
  q2,
  q3,
  q4,
};
