const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
  {
    username: String,
    password: String,
    question_ids: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
      default: [],
    },
    comment_ids: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
      default: [],
    },
    upvoted_qids: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
      default: [],
    },
    downvoted_qids: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
      default: [],
    },
    upvoted_cids: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
      default: [],
    },
    downvoted_cids: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
      default: [],
    },
    role: {
      type: String,
      enum: ["admin", "poster"],
      default: "poster",
    },
  },
  { collection: "User" }
);

module.exports = UserSchema;
