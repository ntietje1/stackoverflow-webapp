let Comment = require("./models/comment");
let Question = require("./models/question");
let User = require("./models/user");

const { MONGO_URL } = require("./config");

let mongoose = require("mongoose");
mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

const populate = async () => {
  console.log("Clearing database");

  await User.deleteMany({});
  await Comment.deleteMany({});
  await Question.deleteMany({});

  console.log("Populating database");

  const user1 = await User.create({ username: "user1", role: "admin" });
  const user2 = await User.create({ username: "user2" });
  const user3 = await User.create({ username: "user3" });
  const user4 = await User.create({ username: "user4" });
  const user5 = await User.create({ username: "user5" });

  const tag1 = "tag1";
  const tag2 = "tag2";
  const tag3 = "tag3";
  const tag4 = "tag4";
  const tag5 = "tag5";
  const tag6 = "tag6";
  const tag7 = "tag7";
  const tag8 = "tag8";

  const comment1 = await Comment.create({
    text: "This is the first comment",
    user_id: user1._id,
    votes: 5,
    post_date_time: new Date("2023-11-20T03:24:42"),
  });

  user1.comment_ids.push(comment1._id);

  const comment2 = await Comment.create({
    text: "This is the second comment",
    user_id: user2._id,
    votes: 3,
    post_date_time: new Date("2023-11-23T08:24:00"),
  });

  user2.comment_ids.push(comment2._id);

  const comment3 = await Comment.create({
    text: "This is the third comment",
    user_id: user3._id,
    votes: 7,
    post_date_time: new Date("2023-11-18T09:24:00"),
  });

  user3.comment_ids.push(comment3._id);

  const comment4 = await Comment.create({
    text: "This is the fourth comment",
    user_id: user4._id,
    votes: 2,
    post_date_time: new Date("2023-11-12T03:30:00"),
  });

  user4.comment_ids.push(comment4._id);

  const comment5 = await Comment.create({
    text: "This is the fifth comment",
    user_id: user5._id,
    votes: 4,
    post_date_time: new Date("2023-11-01T15:24:19"),
  });

  user5.comment_ids.push(comment5._id);

  const comment6 = await Comment.create({
    text: "This is the sixth comment",
    user_id: user1._id,
    votes: 8,
    post_date_time: new Date("2023-02-19T18:20:59"),
  });

  user1.comment_ids.push(comment6._id);

  const comment7 = await Comment.create({
    text: "This is the seventh comment",
    user_id: user2._id,
    votes: 3,
    post_date_time: new Date("2023-11-20T03:24:42"),
  });

  user2.comment_ids.push(comment7._id);

  const question1 = await Question.create({
    title: "Question 1",
    text: "This is the first question",
    user_id: user1._id,
    post_date_time: new Date("2023-11-20T03:24:42"),
    views: 5,
    votes: 3,
    hidden: false,
    comments: [comment1, comment2],
    tags: [tag1, tag2, tag7],
  });

  user1.question_ids.push(question1._id);

  const question2 = await Question.create({
    title: "Question 2",
    text: "This is the second question",
    user_id: user2._id,
    post_date_time: new Date("2023-11-23T08:24:00"),
    views: 3,
    votes: 2,
    hidden: false,
    comments: [comment3, comment4],
    tags: [tag3, tag4],
  });

  user2.question_ids.push(question2._id);

  const question3 = await Question.create({
    title: "Question 3",
    text: "This is the third question",
    user_id: user3._id,
    post_date_time: new Date("2023-11-18T09:24:00"),
    views: 7,
    votes: 5,
    hidden: false,
    comments: [comment5, comment6],
    tags: [tag5, tag6, tag7],
  });

  user3.question_ids.push(question3._id);

  const question4 = await Question.create({
    title: "Question 4",
    text: "This is the fourth question",
    user_id: user1._id,
    post_date_time: new Date("2023-11-12T03:30:00"),
    views: 2,
    votes: 1,
    hidden: false,
    comments: [comment7],
    tags: [tag7, tag8],
  });

  user1.question_ids.push(question4._id);

  user1.upvoted_qids.push(question1._id);

  await user1.save();
  await user2.save();
  await user3.save();
  await user4.save();
  await user5.save();

  console.log("Database populated");
};

populate()
  .catch((err) => {
    console.log("ERROR: " + err);
  })
  .finally(() => {
    if (db) db.close();
  });

console.log("processing ...");
