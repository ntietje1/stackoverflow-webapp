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

  // Create comments
  const jsA = await Comment.create({
    text: "Not good.",
    username: "frank",
    post_date_time: "April 20, 2024",
    votes: -3,
    hidden: false,
  });
  const jsB = await Comment.create({
    text: "Great",
    username: "mark",
    post_date_time: "April 21, 2024",
    votes: 1,
    hidden: false,
  });
  const reactA = await Comment.create({
    text: "I love it!",
    username: "nick",
    post_date_time: "April 19, 2024",
    votes: 2,
    hidden: true,
  });
  const javaA = await Comment.create({
    text: "Not sure.",
    username: "nick",
    post_date_time: "April 21, 2024",
    votes: 0,
    hidden: false,
  });

  console.log("Created comments");

  // Create questions

  const swift = await Question.create({
    title: "What's swift?",
    description: "I don't know. Who can help?",
    posted_by: "frank",
    post_date_time: new Date("April 20, 2024 03:00:00"),
    votes: 2,
    hidden: false,
    comments: [],
    tags: ["swift"],
  });

  const js = await Question.create({
    title: "How javascript",
    description: "Is it good to write?",
    posted_by: "nick",
    post_date_time: new Date("April 19, 2024 06:00:00"),
    votes: 0,
    hidden: false,
    comments: [jsA, jsB],
    tags: ["new"],
  });

  const react = await Question.create({
    title: "React",
    description: "react, is it good to use?",
    posted_by: "mark",
    post_date_time: new Date("April 18, 2024 06:00:00"),
    votes: -2,
    hidden: false,
    comments: [reactA],
    tags: ["new"],
  });

  const java = await Question.create({
    title: "NEU teaches Java?",
    description: "What about other schools?",
    posted_by: "mark",
    post_date_time: new Date("April 20, 2024 21:00:00"),
    votes: -2,
    hidden: true,
    comments: [javaA],
    tags: ["new", "NEU"],
  });

  console.log("Created questions");

  // Create users
  const frank = await User.create({
    username: "frank",
    password: "1",
    role: "admin",
    question_ids: [swift._id],
    comment_ids: [jsA._id],
    upvoted_qids: [swift._id],
    downvoted_qids: [react._id],
    upvoted_cids: [react._id],
    downvoted_cids: [jsA._id],
  });
  const nick = await User.create({
    username: "nick",
    password: "1",
    role: "admin",
    question_ids: [js._id],
    comment_ids: [reactA._id, javaA._id],
    upvoted_qids: [swift._id],
    downvoted_qids: [java._id],
    upvoted_cids: [reactA._id, jsB._id],
    downvoted_cids: [jsA._id],
  });
  const mark = await User.create({
    username: "mark",
    password: "1",
    role: "poster",
    question_ids: [react._id, java._id],
    comment_ids: [jsB._id],
    upvoted_qids: [],
    downvoted_qids: [java._id, react._id],
    upvoted_cids: [],
    downvoted_cids: [jsA._id],
  });

  console.log(`Created users: ${frank._id}, ${nick._id}, ${mark._id}`);

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
