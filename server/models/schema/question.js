const mongoose = require("mongoose");

const QuestionSchema = mongoose.Schema(
  {
    title: String,
    description: String,
    posted_by: String,
    post_date_time: { type: Date, default: Date.now() },
    votes: { type: Number, default: 0 },
    hidden: { type: Boolean, default: false },
    comments: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
      default: [],
    },
    tags: {
      type: [{ type: String }],
      default: [],
    },
  },
  { collection: "Question" }
);
module.exports = QuestionSchema;
