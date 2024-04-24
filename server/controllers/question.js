const express = require("express");
const Question = require("../models/question");
const User = require("../models/user");

const router = express.Router();

const requireLogin = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).send("User is not logged in");
  }
  next();
};

const determineUserVote = async (user, question) => {
  if (!user) return "none";
  const foundUser = await User.findOne({ _id: user._id });
  if (!foundUser) return "none";
  if (foundUser.upvoted_qids.includes(question._id)) {
    return "up";
  } else if (foundUser.downvoted_qids.includes(question._id)) {
    return "down";
  } else {
    return "none";
  }
};

const hiddenFilter = (q) =>
  q.hidden === "" || q.hidden === undefined || q.hidden === false;
const titleFilter = (q, title) =>
  title === "" ||
  title === undefined ||
  q.title.toLowerCase().includes(title.toLowerCase());
const descriptionFilter = (q, keywords) =>
  keywords.length === 0 ||
  keywords === undefined ||
  keywords.some((keyword) =>
    q.description.toLowerCase().includes(keyword.toLowerCase())
  );
const tagsFilter = (q, tags) => {
  return (
    tags === "" ||
    tags === undefined ||
    q.tags
      .map((t) => t.toLowerCase().includes(tags.toLowerCase()))
      .filter((c) => c === true).length > 0
  );
};
const earlyFilter = (q, early, earlyDate) =>
  early === "" ||
  early === undefined ||
  new Date(q.post_date_time).getTime() > earlyDate.getTime();
const lateFilter = (q, late, lateDate) =>
  late === "" ||
  late === undefined ||
  new Date(q.post_date_time).getTime() < lateDate.getTime();

const newestSort = (lhs, rhs) =>
  new Date(rhs.post_date_time).getTime() -
  new Date(lhs.post_date_time).getTime();

const activeSort = (lhs, rhs) => {
  const lhsActive = Math.max(
    ...[
      new Date(lhs.post_date_time).getTime(),
      ...lhs.comments.map((c) => new Date(c.post_date_time).getTime()),
    ]
  );

  const rhsActive = Math.max(
    ...[
      new Date(rhs.post_date_time).getTime(),
      ...rhs.comments.map((c) => new Date(c.post_date_time).getTime()),
    ]
  );

  return newestSort(
    { post_date_time: lhsActive },
    { post_date_time: rhsActive }
  );
};

// negative: lhs before rhs
// positive: rhs before lhs
const unansweredSort = (lhs, rhs) => {
  if (lhs.comments.length === 0 && rhs.comments.length > 0) {
    return -1;
  } else if (rhs.comments.length === 0 && lhs.comments.length > 0) {
    return 1;
  } else if (
    (rhs.comments.length === 0 && lhs.comments.length === 0) ||
    (rhs.comments.length > 0 && lhs.comments.length > 0)
  ) {
    return newestSort(lhs, rhs);
  }
};

const sortQuestions = (lhs, rhs, order) => {
  if (order === "newest" || order === "" || order === undefined) {
    return newestSort(lhs, rhs);
  } else if (order === "active") {
    return activeSort(lhs, rhs);
  } else if (order === "unanswered") {
    return unansweredSort(lhs, rhs);
  } else {
    throw new Error("invalid search parameter");
  }
};

const filterQuesions = (
  q,
  title,
  keywords,
  tags,
  early,
  earlyDate,
  late,
  lateDate
) => {
  return (
    hiddenFilter(q) &&
    titleFilter(q, title) &&
    descriptionFilter(q, keywords) &&
    tagsFilter(q, tags) &&
    earlyFilter(q, early, earlyDate) &&
    lateFilter(q, late, lateDate)
  );
};

const getKeywords = (description) => {
  return (description ?? "")
    .split(",")
    .join(" ")
    .split(" ")
    .filter((word) => word !== "");
};

const getQuestionsByFilter = async (req, res) => {
  const { title, description, early, late, order, tags } = req.query;
  const keywords = getKeywords(description);
  let earlyDate = new Date();
  earlyDate.setTime(early);
  let lateDate = new Date(late);
  lateDate.setTime(late);
  try {
    const questions = await Question.find({}).populate("comments");
    const questionObjects = questions.map((q) => q._doc);
    const filtered = questionObjects.filter((q) =>
      filterQuesions(q, title, keywords, tags, early, earlyDate, late, lateDate)
    );
    let sorted = filtered.sort((lhs, rhs) => sortQuestions(lhs, rhs, order));
    const voted = await Promise.all(
      sorted.map(async (question) => {
        const userVote = await determineUserVote(req.session.user, question);
        return {
          ...question,
          userVote: userVote,
        };
      })
    );
    return res.json(voted);
  } catch (error) {
    return res
      .status(404)
      .send({ error: `Trouble fetching questions. ${error ?? ""}` });
  }
};

const getQuestionByQid = async (req, res) => {
  const { qid } = req.params;

  try {
    let question = await Question.findOne({ _id: qid }).populate("comments");

    const userVote = await determineUserVote(req.session.user, question._doc);

    return res.json({
      ...question._doc,
      comments: question._doc.comments.filter((c) => c.hidden !== true),
      userVote: userVote,
    });
  } catch {
    return res.status(404).send(`Question with id ${qid} not found`);
  }
};

// check if vote is valid, then remove current vote if necessary, then push new vote
const voteChanges = {
  up: { upvoted: -1, downvoted: 2, default: 1 },
  down: { downvoted: 1, upvoted: -2, default: -1 },
  none: { downvoted: 1, upvoted: -1, default: 0 },
};

const pushVote = async (vote, user, question, qid) => {
  user.upvoted_qids = user.upvoted_qids.filter((id) => id !== qid);
  user.downvoted_qids = user.downvoted_qids.filter((id) => id !== qid);
  if (vote === "up") {
    user.upvoted_qids.push(qid);
    question.userVote = "up";
  } else if (vote === "down") {
    user.downvoted_qids.push(qid);
    question.userVote = "down";
  } else if (vote === "none") {
    question.userVote = "none";
  }
};

const changeVote = (user, qid, question, vote) => {
  if (user.upvoted_qids.includes(qid)) {
    question.votes += voteChanges[vote].upvoted || 0;
  } else if (user.downvoted_qids.includes(qid)) {
    question.votes += voteChanges[vote].downvoted || 0;
  } else {
    question.votes += voteChanges[vote].default || 0;
  }
  return question;
};

const findQuestionById = async (qid) => {
  const q = await Question.findOne({
    _id: qid,
    hidden: false,
  });
  return q;
};

const checkVote = (vote, qid, user) => {
  return (
    vote === "none" ||
    (vote === "up" && user.upvoted_qids.includes(qid)) ||
    (vote === "down" && user.downvoted_qids.includes(qid))
  );
};

const updateUser = async (user, question) => {
  await User.findOneAndUpdate(
    { _id: user._id },
    {
      upvoted_qids: user.upvoted_qids,
      downvoted_qids: user.downvoted_qids,
    }
  );
  await question.save();
};

const voteQuestion = async (req, res) => {
  const { qid } = req.params;
  const { vote } = req.body;
  const user = req.session.user;
  if (!user) {
    return res.status(401).send("User is not logged in");
  }
  let question = await findQuestionById(qid);

  if (["up", "down", "none"].includes(vote)) {
    question = changeVote(user, qid, question, vote);
  } else {
    return res.status(400).send(`Invalid vote: ${vote}`);
  }
  if (checkVote(vote, qid, user)) {
    pushVote("none", user, question, qid);
  } else {
    pushVote(vote, user, question, qid);
  }

  await updateUser(user, question);

  res.status(200).json({ votes: question.votes, userVote: question.userVote });
};

const handlePosterEdit = (title, description, tags, hidden, question) => {
  if (title) question.title = title;
  if (description) question.description = description;
  if (tags) {
    question.tags = tags.map((tag) => tag.trim()).filter((tag) => tag !== "");
  }
  if (hidden) {
    question.hidden = hidden;
  }

  return question;
};

const editQuestion = async (req, res) => {
  const { qid } = req.params;
  const { title, description, tags, hidden } = req.body;

  let question = await Question.findOne({
    _id: qid,
  });

  if (!question) {
    return res.status(404).send(`Question with id ${qid} not found`);
  }

  try {
    if (req.session.user.username === question.posted_by) {
      question = handlePosterEdit(title, description, tags, hidden, question);
    } else if (req.session.user.role === "admin") {
      if (title) throw new Error("Admins cannot change title");
      if (description) throw new Error("Admins cannot change description");
      if (tags) throw new Error("Admins cannot change tags");
      question.hidden = true;
    } else {
      return res.status(500).send("invalid sequence of changes");
    }

    await question.save();

    return res.status(200).json(question);
  } catch {
    res.status(500).send("invalid sequence of changes");
  }
};

const addQuestion = async (req, res) => {
  const title = req.body.title ?? "";
  const description = req.body.description ?? "";
  const tags = (req.body.tags ?? []).filter((tag) => tag !== "");

  const user = req.session.user;

  if (!user) {
    return res.status(500).send("User is not logged in");
  } else if (title === "" || description === "") {
    return res.status(500).send("Title and description must both have content");
  } else {
    const question = await Question.create({
      title: title,
      description: description,
      tags: tags,
      posted_by: user.username,
      post_date_time: new Date(),
    });
    const foundUser = await User.findOneAndUpdate(
      { _id: req.session.user._id },
      { $push: { question_ids: question._id } }
    );
    await foundUser.save();

    return res.status(200).json(question);
  }
};

router.get("/", getQuestionsByFilter);
router.get("/:qid", getQuestionByQid);
router.put("/:qid", requireLogin, editQuestion);
router.post("/", requireLogin, addQuestion);
router.put("/:qid/vote", requireLogin, voteQuestion);

module.exports = [router];
