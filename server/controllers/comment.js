const express = require("express");
const Comment = require("../models/comment");
const Question = require("../models/question");
const User = require("../models/user");

const router = express.Router();

const getCommentByCid = async (req, res) => {
  const { cid } = req.params;
  try {
    const comment = await Comment.findOne({ _id: cid, hidden: false });

    const poster = await User.findOne({ username: comment.posted_by });

    return res.status(200).json({
      _id: comment._id,
      description: comment.text,
      username: poster.username,
    });
  } catch {
    return res.status(404).send(`Comments for id ${cid} not found`);
  }
};

const addComment = async (req, res) => {
  const { qid, text } = req.body;

  const user = req.session.user;

  if (!user) {
    return res.status(500).send("User is not logged in");
  }

  try {
    const question = await Question.findOne({ _id: qid, hidden: false });
    const foundUser = await User.findOne({
      _id: req.session.user._id,
    });
    if (!question) {
      return res.status(404).send(`Question with id ${qid} not found`);
    }
    const comment = await Comment.create({
      text: text,
      username: user.username,
      post_date_time: new Date(),
    });

    question.comments.push(comment._id);
    await question.save();
    foundUser.comment_ids.push(comment._id);
    await foundUser.save();
    return res.status(200).json(comment);
  } catch {
    return res
      .status(404)
      .send(`Could not add comment to question with id ${qid}`);
  }
};

const editComment = async (req, res) => {
  const { cid } = req.params;
  const { text, hidden } = req.body;

  const user = req.session.user;
  if (!user) {
    return res.status(500).send(`User not logged in`);
  }

  const existingComment = await Comment.findOne({
    _id: cid,
  });
  const foundUser = await User.findOne({
    _id: req.session.user._id,
  });

  if (!existingComment || foundUser.comment_ids.includes(cid) === false) {
    return res
      .status(404)
      .send(`No comment with id ${cid} from user ${user.username} found`);
  }

  try {
    if (text && hidden === undefined) {
      const updated = await Comment.findOneAndUpdate(
        { _id: cid },
        { text: text },
        { new: true }
      );
      res.json(updated);
    } else if (hidden && text === undefined) {
      const updated = await Comment.findOneAndUpdate(
        { _id: cid },
        { hidden: true },
        { new: true }
      );
      res.json(updated);
    } else {
      return res.status(500).send("Invalid sequence of changes");
    }
  } catch {
    return res
      .status(404)
      .send(`Error occurred when editing comment with id ${cid}`);
  }
};

const handleUp = (user, comment, cid) => {
  // rmove from other list if present
  if (user.downvoted_cids.includes(cid)) {
    user.downvoted_cids.pull(cid); // remove downvoted
    comment.votes += 1;
  }

  if (user.upvoted_cids.includes(cid)) {
    user.upvoted_cids.pull(cid); // remove upvoted
    comment.votes -= 1;
  } else {
    user.upvoted_cids.push(cid); // add upvote
    comment.votes += 1;
  }
};

const handleDown = (user, comment, cid) => {
  // remove from other list if present
  if (user.upvoted_cids.includes(cid)) {
    user.upvoted_cids.pull(cid); // remove upvote
    comment.votes -= 1;
  }

  if (user.downvoted_cids.includes(cid)) {
    user.downvoted_cids.pull(cid); // remove downvote
    comment.votes += 1;
  } else {
    user.downvoted_cids.push(cid); // add downvote
    comment.votes -= 1;
  }
};

const voteComment = async (req, res) => {
  const { cid, vote } = req.params; // comment to vote on, vote to make

  const user = req.session.user;

  if (!user) {
    return res.status(500).send("User is not logged in");
  }

  const foundUser = await User.findOne({ _id: user._id }); // get the user
  const comment = await Comment.findOne({ _id: cid });

  if (!comment) {
    return res.status(404).send(`Comment with id ${cid} not found`);
  }

  if (vote.trim().toLowerCase() === "up") {
    handleUp(foundUser, comment, cid);
  } else if (vote.trim().toLowerCase() === "down") {
    handleDown(foundUser, comment, cid);
  } else {
    return res.status(500).send({ error: "Invalid vote." }); // invalid vote
  }

  await foundUser.save();
  await comment.save();
  return res.status(200).json({ votes: comment.votes });
};

const checkCommentVote = async (req, res) => {
  const { cid } = req.params;

  if (!req.session.user) {
    return res.send("none");
  }

  const user = await User.findOne({ _id: req.session.user._id });

  if (user.upvoted_cids.includes(cid)) {
    return res.send("up");
  } else if (user.downvoted_cids.includes(cid)) {
    return res.send("down");
  } else {
    return res.send("none");
  }
};

router.get("/:cid", getCommentByCid);
router.put("/:cid", editComment);
router.post("/", addComment);
router.put("/:cid/:vote", voteComment);
router.get("/:cid/check-vote", checkCommentVote);

module.exports = router;
