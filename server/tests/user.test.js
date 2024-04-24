const request = require("supertest");
const { default: mongoose } = require("mongoose");
const User = require("../models/user");
const {
  mockSession,
  mockLoggedInUser,
  startServer,
  stopServer,
  getServer,
} = require("./testUtils");

const c1 = {
  _id: "c1",
  text: "a1",
  username: "frank",
  post_date_time: "2024-04-23T15:27:51.232Z",
  votes: 1,
  hidden: false,
};

const c2 = {
  _id: "c2",
  text: "a2",
  username: "frank",
  post_date_time: "2024-04-23T15:27:56.392Z",
  votes: -1,
  hidden: false,
};

const q1doc = {
  _id: "q1",
  title: "q1",
  description: "d1",
  posted_by: "frank",
  post_date_time: "2024-04-23T15:27:46.969Z",
  votes: 1,
  hidden: false,
  comments: ["6627d37731702bcf04b9fbc8", "6627d37c31702bcf04b9fbda"],
  tags: ["t1"],
};

const q1 = {
  ...q1doc,
  _doc: q1doc,
};

const q1voted = {
  ...q1doc,
  userVote: "none",
};

const q1votedFrank = {
  ...q1doc,
  userVote: "up",
};

const q2doc = {
  _id: "q2",
  title: "q2",
  description: "d2",
  posted_by: "frank",
  post_date_time: "2024-04-23T15:28:07.370Z",
  votes: -1,
  hidden: false,
  comments: [],
  tags: ["t2"],
};

const q2 = { ...q2doc, _doc: q2doc };

const q2voted = {
  ...q2doc,
  userVote: "none",
};

const q2votedFrank = {
  ...q2doc,
  userVote: "down",
};

const q3doc = {
  _id: "q3",
  title: "q3",
  description: "d3",
  posted_by: "frank",
  post_date_time: "2024-04-23T15:28:07.370Z",
  votes: -1,
  hidden: false,
  comments: [],
  tags: ["t3"],
};

const q3 = { ...q3doc, _doc: q3doc };

const q3voted = {
  ...q3doc,
  userVote: "none",
};

const q3votedFrank = {
  ...q3doc,
  userVote: "none",
};

const user1 = {
  _id: "frank",
  username: "frank",
  question_ids: ["q1", "q2", "q3"],
  comment_ids: ["c1", "c2"],
  upvoted_qids: ["q1"],
  downvoted_qids: ["q2"],
  upvoted_cids: ["c1"],
  downvoted_cids: ["c2"],
};

const populatedUser1 = {
  _id: "frank",
  comment_ids: [c1, c2],
  downvoted_cids: [c2],
  downvoted_qids: [q2],
  question_ids: [q1, q2, q3],
  upvoted_cids: [c1],
  upvoted_qids: [q1],
  username: "frank",
};

const votedUser1 = {
  _id: "frank",
  comments: [c1, c2],
  downvoted_comments: [c2],
  downvoted_questions: [q2voted],
  questions: [q1voted, q2voted, q3voted],
  upvoted_comments: [c1],
  upvoted_questions: [q1voted],
  username: "frank",
};

const votedUser1frank = {
  _id: "frank",
  comments: [c1, c2],
  downvoted_comments: [c2],
  downvoted_questions: [q2votedFrank],
  questions: [q1votedFrank, q2votedFrank, q3votedFrank],
  upvoted_comments: [c1],
  upvoted_questions: [q1votedFrank],
  username: "frank",
};
describe("GET /user/:username", () => {
  beforeEach(() => {
    startServer();
  });

  afterEach(async () => {
    stopServer();
    await mongoose.disconnect();
  });

  test("should return the user if it exists, user logged out", async () => {
    const { token, connectSidValue } = await mockSession();

    User.findOne = jest.fn().mockImplementation(() => ({
      ...user1,
      populate: jest.fn().mockResolvedValueOnce({
        ...populatedUser1,
        _doc: populatedUser1,
      }),
    }));

    User.find = jest.fn().mockResolvedValueOnce({ ...user1, _doc: user1 });

    const response = await request(getServer())
      .get("/users/user1")
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(votedUser1);
  });

  test("should return the user if it exists, user logged in", async () => {
    const { token, connectSidValue } = await mockLoggedInUser(user1);

    User.findOne = jest.fn().mockImplementation(() => ({
      ...user1,
      populate: jest.fn().mockResolvedValueOnce({
        ...populatedUser1,
        _doc: populatedUser1,
      }),
    }));

    User.find = jest.fn().mockResolvedValueOnce({ ...user1, _doc: user1 });

    const response = await request(getServer())
      .get("/users/user1")
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(votedUser1frank);
  });

  test("user does not exist", async () => {
    const { token, connectSidValue } = await mockLoggedInUser(user1);

    User.findOne = jest.fn().mockImplementation(() => null);

    User.find = jest.fn().mockResolvedValueOnce({ ...user1, _doc: user1 });

    const response = await request(getServer())
      .get("/users/userNone")
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({ message: "Error retrieving user" });
  });

  // it("cannot find the user with the username", async () => {
  //   const { token, connectSidValue } = await mockLoggedInUser(user1);

  //   const response = await request(getServer())
  //     .get("/users/user1")
  //     .set("x-csrf-token", token)
  //     .set("Cookie", [`connect.sid=${connectSidValue}`]);

  //   // expect(response.statusCode).toBe(200);
  //   expect(response.body).toEqual({});
  // });
  // it("finds the user with the username but the user is not logged in", async () => {});
  // it("finds the user with the username and the user is logged in", async () => {});

  // it("should return a user's questions and answers", async () => {
  //   const { token, connectSidValue } = await mockLoggedInUser(user1);

  //   User.findOne = jest
  //     .fn()
  //     .mockImplementationOnce(() => ({
  //       populate: jest.fn().mockResolvedValueOnce(populatedUser2),
  //     }))
  //     .mockImplementationOnce(() => user1);
  //   const resp = await request(getServer())
  //     .get(`/user/${user1.username}`)
  //     .set("x-csrf-token", token)
  //     .set("Cookie", [`connect.sid=${connectSidValue}`]);

  //   expect(resp.status).toEqual(200);
  //   expect(resp.body).toEqual(populatedUser2);
  // });

  //   it("should return a user's questions and answers when the user has no answers", async () => {
  //     const { token, connectSidValue } = await mockLoggedInUser(user2);

  //     Question.find = jest.fn().mockResolvedValueOnce([q1, q2, q3, q4]);

  //     const resp = await request(getServer())
  //       .get(`/user/${user2.username}`)
  //       .set("x-csrf-token", token)
  //       .set("Cookie", [`connect.sid=${connectSidValue}`]);

  //     expect(resp.status).toEqual(200);
  //     expect(resp.body.questions).toEqual([q3]);
  //     expect(resp.body.answers).toEqual([]);
  //   });

  //   it("should return a user's questions and answers when the user has no questions", async () => {
  //     const { token, connectSidValue } = await mockLoggedInUser(user3);

  //     Question.find = jest.fn().mockResolvedValueOnce([q1, q2, q3, q4]);

  //     const resp = await request(getServer())
  //       .get(`/user/${user3.username}`)
  //       .set("x-csrf-token", token)
  //       .set("Cookie", [`connect.sid=${connectSidValue}`]);

  //     expect(resp.status).toEqual(200);
  //     expect(resp.body.questions).toEqual([]);
  //     expect(resp.body.answers).toEqual([q4]);
  //   });

  //   it("should return a 404 if the user does not exist", async () => {
  //     const { token, connectSidValue } = await mockLoggedInUser(user1);

  //     User.findOne = jest.fn().mockResolvedValueOnce(null);

  //     const resp = await request(getServer())
  //       .get(`/user/${user1.username}`)
  //       .set("x-csrf-token", token)
  //       .set("Cookie", [`connect.sid=${connectSidValue}`]);

  //     expect(resp.status).toEqual(404);
  //   });
});
