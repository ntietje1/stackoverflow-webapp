const mongoose = require("mongoose");

var CommentSchema = mongoose.Schema(
  {
    text: String,
    username: String,
    post_date_time: { type: Date, default: Date.now() },
    votes: { type: Number, default: 0 },
    hidden: { type: Boolean, default: false },
  },
  { collection: "Comment" }
);

module.exports = CommentSchema;
