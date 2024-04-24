const express = require("express");
const User = require("../models/user");

const router = express.Router();

const determineUserVote = (user, question) => {
  if (user) {
    if (user.upvoted_qids.includes(question._id)) {
      return "up";
    } else if (user.downvoted_qids.includes(question._id)) {
      return "down";
    } else {
      return "none";
    }
  } else {
    return "none";
  }
};

const prepareUser = (user, viewingUser) => {
  return {
    _id: user._id,
    comments: user.comment_ids,
    downvoted_comments: user.downvoted_cids,
    downvoted_questions: user.downvoted_qids.map((question) => {
      return {
        ...question._doc,
        userVote: determineUserVote(viewingUser, question),
      };
    }),
    questions: user.question_ids.map((question) => {
      return {
        ...question._doc,
        userVote: determineUserVote(viewingUser, question),
      };
    }),
    upvoted_comments: user.upvoted_cids,
    upvoted_questions: user.upvoted_qids.map((question) => {
      return {
        ...question._doc,
        userVote: determineUserVote(viewingUser, question),
      };
    }),
    username: user.username,
  };
};

const getUserByUsername = async (req, res) => {
  const username = req.params.username;
  try {
    let user = await User.findOne({ username: username }).populate(
      "question_ids comment_ids upvoted_qids downvoted_qids upvoted_cids downvoted_cids"
    );

    let viewingUser = null;
    if (req.session.user && req.session.user._id) {
      viewingUser = await User.findOne({
        _id: req.session.user._id,
      });
    }

    return res.json(prepareUser(user, viewingUser));
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving user" });
  }
};

router.get("/:username", getUserByUsername);

module.exports = router;
