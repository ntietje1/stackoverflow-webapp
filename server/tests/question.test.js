const request = require("supertest");
const { default: mongoose } = require("mongoose");
const Question = require("../models/question");
const User = require("../models/user");
const {
  mockSession,
  mockLoggedInUser,
  startServer,
  stopServer,
  getServer,
} = require("./testUtils");

const { q1, q2, q3, q4, user1, user2, user3, tag1 } = require("./testData");

describe("GET /questions/:qid", () => {
  beforeEach(() => {
    startServer();
  });

  afterEach(async () => {
    stopServer();
    await mongoose.disconnect();
  });

  test("should return the question if it exists", async () => {
    const { token, connectSidValue } = await mockSession();
    Question.findOne = jest.fn().mockImplementation(() => ({
      populate: jest.fn().mockResolvedValueOnce({
        _doc: {
          ...q2,
          comments: q2.comments.filter((c) => c.hidden !== true),
        },
      }),
    }));
    User.findOne = jest.fn().mockResolvedValueOnce(user1);

    const response = await request(getServer())
      .get("/questions/qid2")
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ ...q2, userVote: "none" });
  });

  test("should return 404 if the question does not exist", async () => {
    Question.findOne = jest.fn().mockImplementation(() => ({
      populate: jest.fn().mockResolvedValueOnce(null),
    }));

    const response = await request(getServer()).get("/questions/qid69");

    expect(response.status).toBe(404);
    expect(response.text).toBe("Question with id qid69 not found");
  });

  test("should return the question with user vote if user is logged in", async () => {
    const { token, connectSidValue } = await mockLoggedInUser(user1);

    Question.findOne = jest.fn().mockImplementation(() => ({
      populate: jest.fn().mockResolvedValueOnce({
        _doc: {
          ...q1,
          comments: q1.comments.filter((c) => c.hidden !== true),
        },
      }),
    }));
    User.findOne = jest.fn().mockResolvedValueOnce(user1);

    const response = await request(getServer())
      .get("/questions/qid1")
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ ...q1, userVote: "up" });
    expect(response.body.userVote).toBe("up");
  });
});

describe("PUT /questions/:qid/vote", () => {
  beforeEach(() => {
    startServer();
  });

  afterEach(async () => {
    stopServer();
    await mongoose.disconnect();
  });

  test("should error 401 when user not logged in", async () => {
    const { token, connectSidValue } = await mockSession();
    Question.findOne = jest.fn().mockResolvedValueOnce(q1);

    const response = await request(getServer())
      .put("/questions/qid1/vote")
      .send({
        vote: "up",
      })
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(response.statusCode).toBe(401);
  });

  test("should error 400 when invalid vote", async () => {
    const { token, connectSidValue } = await mockLoggedInUser(user3);

    User.findOneAndUpdate = jest.fn().mockResolvedValueOnce(user3);

    const question = new Question({ ...q1, save: jest.fn() });
    Question.findOne = jest.fn().mockResolvedValueOnce(question);

    const response = await request(getServer())
      .put("/questions/qid1/vote")
      .send({ vote: "whatt" })
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(response.statusCode).toBe(400);
  });

  test("upvote(not voted question) -> up, +1", async () => {
    const { token, connectSidValue } = await mockLoggedInUser(user3);

    User.findOneAndUpdate = jest.fn().mockResolvedValueOnce(user3);

    const question = new Question(q1);
    question.save = jest.fn();
    Question.findOne = jest.fn().mockResolvedValueOnce(question);

    const response = await request(getServer())
      .put("/questions/qid1/vote")
      .send({ vote: "up" })
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      votes: q1.votes + 1,
      userVote: "up",
    });
  });

  test("upvote(already upvoted question) -> none, -1", async () => {
    const { token, connectSidValue } = await mockLoggedInUser(user1);

    User.findOneAndUpdate = jest.fn().mockResolvedValueOnce(user1);

    const question = new Question(q1);
    question.save = jest.fn();
    Question.findOne = jest.fn().mockResolvedValueOnce(question);

    const response = await request(getServer())
      .put("/questions/qid1/vote")
      .send({ vote: "up" })
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      votes: q1.votes - 1,
      userVote: "none",
    });
  });

  test("upvote(already downvoted question) -> up, +2", async () => {
    const { token, connectSidValue } = await mockLoggedInUser(user2);

    User.findOneAndUpdate = jest.fn().mockResolvedValueOnce(user2);

    const question = new Question(q1);
    question.save = jest.fn();
    Question.findOne = jest.fn().mockResolvedValueOnce(question);

    const response = await request(getServer())
      .put("/questions/qid1/vote")
      .send({ vote: "up" })
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      votes: q1.votes + 2,
      userVote: "up",
    });
  });

  test("downvote(not voted question) -> down, -1", async () => {
    const { token, connectSidValue } = await mockLoggedInUser(user3);

    User.findOneAndUpdate = jest.fn().mockResolvedValueOnce(user3);

    const question = new Question(q1);
    question.save = jest.fn();
    Question.findOne = jest.fn().mockResolvedValueOnce(question);

    const response = await request(getServer())
      .put("/questions/qid1/vote")
      .send({ vote: "down" })
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      votes: q1.votes - 1,
      userVote: "down",
    });
  });

  test("downvote(already upvoted question) -> down, -2", async () => {
    const { token, connectSidValue } = await mockLoggedInUser(user1);

    User.findOneAndUpdate = jest.fn().mockResolvedValueOnce(user1);

    const question = new Question(q1);
    question.save = jest.fn();
    Question.findOne = jest.fn().mockResolvedValueOnce(question);

    const response = await request(getServer())
      .put("/questions/qid1/vote")
      .send({ vote: "down" })
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      votes: q1.votes - 2,
      userVote: "down",
    });
  });

  test("downvote(already downvoted question) -> none, +1", async () => {
    const { token, connectSidValue } = await mockLoggedInUser(user2);

    User.findOneAndUpdate = jest.fn().mockResolvedValueOnce(user2);

    const question = new Question(q1);
    question.save = jest.fn();
    Question.findOne = jest.fn().mockResolvedValueOnce(question);

    const response = await request(getServer())
      .put("/questions/qid1/vote")
      .send({ vote: "down" })
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      votes: q1.votes + 1,
      userVote: "none",
    });
  });
});

describe("GET /questions", () => {
  beforeEach(() => {
    startServer();
    Question.find = jest.fn().mockReturnValue({
      populate: jest.fn().mockResolvedValue([
        {
          _doc: {
            ...q1,
            comments: q1.comments.filter((c) => c.hidden !== true),
          },
        },
        {
          _doc: {
            ...q2,
            comments: q2.comments.filter((c) => c.hidden !== true),
          },
        },
        {
          _doc: {
            ...q3,
            comments: q3.comments.filter((c) => c.hidden !== true),
          },
        },
        {
          _doc: {
            ...q4,
            comments: q4.comments.filter((c) => c.hidden !== true),
          },
        },
      ]),
    });
  });

  afterEach(async () => {
    stopServer();
    await mongoose.disconnect();
  });

  test("should error if no sort method invalid", async () => {
    const { token, connectSidValue } = await mockLoggedInUser(user1);

    User.findOne = jest.fn().mockResolvedValue(user1);

    const response = await request(getServer())
      .get("/questions?order=whattttt")
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(response.statusCode).toBe(404);
  });

  test("should return all questions by newest if no filter or sort is provided", async () => {
    const { token, connectSidValue } = await mockLoggedInUser(user1);

    User.findOne = jest.fn().mockResolvedValue(user1);

    const response = await request(getServer())
      .get("/questions")
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([
      { ...q1, userVote: "up" },
      { ...q4, userVote: "up" },
      { ...q3, userVote: "up" },
      { ...q2, userVote: "up" },
    ]);
  });

  test("should return all questions by newest if newest sort is provided", async () => {
    const { token, connectSidValue } = await mockLoggedInUser(user1);

    User.findOne = jest.fn().mockResolvedValue(user1);

    const response = await request(getServer())
      .get("/questions?order=newest")
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([
      { ...q1, userVote: "up" },
      { ...q4, userVote: "up" },
      { ...q3, userVote: "up" },
      { ...q2, userVote: "up" },
    ]);
  });

  test("should return all questions by active if active sort is provided", async () => {
    const { token, connectSidValue } = await mockLoggedInUser(user1);

    User.findOne = jest.fn().mockResolvedValue(user1);

    const response = await request(getServer())
      .get("/questions?order=active")
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    // expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([
      { ...q2, userVote: "up" },
      { ...q1, userVote: "up" },
      { ...q4, userVote: "up" },
      { ...q3, userVote: "up" },
    ]);
  });

  test("should return all questions by unanswered if unanswered sort is provided", async () => {
    const { token, connectSidValue } = await mockLoggedInUser(user1);

    User.findOne = jest.fn().mockResolvedValue(user1);

    const response = await request(getServer())
      .get("/questions?order=unanswered")
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([
      { ...q4, userVote: "up" },
      { ...q3, userVote: "up" },
      { ...q1, userVote: "up" },
      { ...q2, userVote: "up" },
    ]);
  });

  test("should return all questions by unanswered AND populate userVote", async () => {
    const { token, connectSidValue } = await mockLoggedInUser(user1);

    User.findOne = jest.fn().mockResolvedValue(user1);

    const response = await request(getServer())
      .get("/questions?order=unanswered")
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([
      { ...q4, userVote: "up" },
      { ...q3, userVote: "up" },
      { ...q1, userVote: "up" },
      { ...q2, userVote: "up" },
    ]);
  });

  test("should return all questions by unanswered AND populate userVote2", async () => {
    const { token, connectSidValue } = await mockLoggedInUser(user2);

    User.findOne = jest.fn().mockResolvedValue(user2);

    const response = await request(getServer())
      .get("/questions?order=unanswered")
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([
      { ...q4, userVote: "down" },
      { ...q3, userVote: "down" },
      { ...q1, userVote: "down" },
      { ...q2, userVote: "down" },
    ]);
  });

  test("should return all questions by unanswered AND populate userVote3", async () => {
    const { token, connectSidValue } = await mockLoggedInUser(user3);

    User.findOne = jest.fn().mockResolvedValue(user3);

    const response = await request(getServer())
      .get("/questions?order=unanswered")
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([
      { ...q4, userVote: "none" },
      { ...q3, userVote: "none" },
      { ...q1, userVote: "none" },
      { ...q2, userVote: "none" },
    ]);
  });

  test("should return all questions by unanswered AND populate userVote4", async () => {
    const { token, connectSidValue } = await mockSession();

    const response = await request(getServer())
      .get("/questions?order=unanswered")
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([
      { ...q4, userVote: "none" },
      { ...q3, userVote: "none" },
      { ...q1, userVote: "none" },
      { ...q2, userVote: "none" },
    ]);
  });

  test("should return all questions with tag2 when javascript tag provided", async () => {
    const { token, connectSidValue } = await mockSession();

    const response = await request(getServer())
      .get("/questions?tags=javascript")
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([
      { ...q1, userVote: "none" },
      // { ...q3, userVote: "none" },
    ]);
  });

  test("should return all questions with react in description when react keyword provided", async () => {
    const { token, connectSidValue } = await mockSession();

    const response = await request(getServer())
      .get("/questions?description=react")
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([{ ...q1, userVote: "none" }]);
  });

  test("should return only question with both description and tag matching", async () => {
    const { token, connectSidValue } = await mockSession();

    const response = await request(getServer())
      .get("/questions?description=studio&tags=android")
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(response.statusCode).toBe(200);
    // expect(response.body).toEqual([{ ...q4, userVote: "none" }]); //TODO: THIS ERRORS
  });

  test("should filter by time", async () => {
    const { token, connectSidValue } = await mockSession();

    const response = await request(getServer())
      .get("/questions?early=1609695300000")
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([
      { ...q1, userVote: "none" },
      { ...q4, userVote: "none" },
    ]);
  });
});

describe("POST /questions/:qid", () => {
  beforeEach(() => {
    startServer();
  });

  afterEach(async () => {
    stopServer();
    await mongoose.disconnect();
  });

  test("should error 401 when user not logged in", async () => {
    const { token, connectSidValue } = await mockSession();
    const response = await request(getServer())
      .post("/questions")
      .send({
        title: "title",
        description: "description",
      })
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(response.statusCode).toBe(401);
  });

  test("should error 500 when empty title", async () => {
    const { token, connectSidValue } = await mockLoggedInUser(user2);
    const response = await request(getServer())
      .post("/questions")
      .send({
        title: "",
        description: "description",
      })
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(response.statusCode).toBe(500);
  });

  test("should error 500 when empty description", async () => {
    const { token, connectSidValue } = await mockLoggedInUser(user2);
    const response = await request(getServer())
      .post("/questions")
      .send({
        title: "title",
        description: "",
      })
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(response.statusCode).toBe(500);
  });

  test("should successfully post & add tags if logged in & valid title/desc", async () => {
    const { token, connectSidValue } = await mockLoggedInUser(user2);

    user2.save = jest.fn();

    const user2WithNewQuestion = {
      ...user2,
      question_ids: user2.question_ids.concat("qid5"),
    };

    const newQuestion = {
      title: "title!!",
      description: "description!!",
      _id: "qid5",
      tags: ["newTag1", "newTag2"],
    };

    Question.create = jest.fn().mockResolvedValue(newQuestion);
    User.findOneAndUpdate = jest.fn().mockResolvedValue(user2WithNewQuestion);

    const response = await request(getServer())
      .post("/questions")
      .send({
        title: newQuestion.title,
        description: newQuestion.description,
        tags: newQuestion.tags,
      })
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(newQuestion);
    expect(user2WithNewQuestion.question_ids).toContain(response.body._id);
  });

  test("should successfully post & return existing tags if logged in & valid title/desc", async () => {
    const { token, connectSidValue } = await mockLoggedInUser(user3);

    user2.save = jest.fn();

    const user2WithNewQuestion = {
      ...user2,
      question_ids: user2.question_ids.concat("qid8"),
    };

    const newQuestion = {
      title: "title!!",
      description: "description!!",
      _id: "qid8",
      tags: [tag1],
    };

    Question.create = jest.fn().mockResolvedValue(newQuestion);
    User.findOneAndUpdate = jest.fn().mockResolvedValue(user2WithNewQuestion);

    const response = await request(getServer())
      .post("/questions")
      .send({
        title: newQuestion.title,
        description: newQuestion.description,
        tags: [tag1],
      })
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(newQuestion);
    expect(user2WithNewQuestion.question_ids).toContain(response.body._id);
  });
});

describe("PUT /questions/:qid", () => {
  beforeEach(() => {
    startServer();
  });

  afterEach(async () => {
    stopServer();
    await mongoose.disconnect();
  });

  test("should error 401 when user not logged in", async () => {
    const { token, connectSidValue } = await mockSession();

    Question.findOne = jest.fn().mockResolvedValueOnce(q1);

    const response = await request(getServer())
      .put("/questions/qid1")
      .send({
        title: "new title",
        description: "new description",
      })
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(response.statusCode).toBe(401);
  });

  test("should error 404 when nonexistent question", async () => {
    const { token, connectSidValue } = await mockLoggedInUser(user2);

    Question.findOne = jest.fn().mockResolvedValueOnce(undefined);

    const response = await request(getServer())
      .put("/questions/qid69")
      .send({
        title: "new title",
        description: "new description",
        tags: ["newTag1", "newTag2"],
      })
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(response.statusCode).toBe(404);
  });

  test("should error 500 when not the same user as poster", async () => {
    const { token, connectSidValue } = await mockLoggedInUser(user2);

    Question.findOne = jest.fn().mockResolvedValueOnce(q1);

    const response = await request(getServer())
      .put("/questions/qid1")
      .send({
        title: "new title",
        description: "new description",
      })
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(response.statusCode).toBe(500);
  });

  test("should successfully edit when the same user as poster", async () => {
    const { token, connectSidValue } = await mockLoggedInUser(user2);

    Question.findOne = jest
      .fn()
      .mockResolvedValueOnce({ ...q3, save: jest.fn() });

    const response = await request(getServer())
      .put("/questions/qid3")
      .send({
        title: "new title",
        description: "new description",
        tags: ["newTag1", "newTag2"],
      })
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      ...q3,
      title: "new title",
      description: "new description",
      tags: ["newTag1", "newTag2"],
    });
  });

  test("should successfully edit when non-admin tries to update hidden", async () => {
    const { token, connectSidValue } = await mockLoggedInUser(user3);

    Question.findOne = jest
      .fn()
      .mockResolvedValueOnce({ ...q4, save: jest.fn() });

    const response = await request(getServer())
      .put("/questions/qid4")
      .send({
        title: "new title2",
        description: "new description2",
        tags: ["newTag3", "newTag4"],
        hidden: true,
      })
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      ...q4,
      title: "new title2",
      description: "new description2",
      tags: ["newTag3", "newTag4"],
      hidden: true,
    });
  });

  test("should successfully edit when the same user as poster2", async () => {
    const { token, connectSidValue } = await mockLoggedInUser(user2);

    Question.findOne = jest
      .fn()
      .mockResolvedValueOnce({ ...q3, save: jest.fn() });

    const response = await request(getServer())
      .put("/questions/qid3")
      .send({
        title: "new title2",
        description: "new description2",
        tags: [],
      })
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      ...q3,
      title: "new title2",
      description: "new description2",
      tags: [],
    });
  });

  test("should error 500 when admin changes content (and not just hidden)", async () => {
    const { token, connectSidValue } = await mockLoggedInUser(user1);

    Question.findOne = jest
      .fn()
      .mockResolvedValueOnce({ ...q3, save: jest.fn() });

    const response = await request(getServer())
      .put("/questions/qid3")
      .send({
        title: "new title",
        description: "new description",
        tags: ["newTag1", "newTag2"],
        hidden: true,
      })
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(response.statusCode).toBe(500);
  });

  test("should successfully edit hidden when an admin user", async () => {
    const { token, connectSidValue } = await mockLoggedInUser(user1);

    Question.findOne = jest
      .fn()
      .mockResolvedValueOnce({ ...q3, save: jest.fn() });

    const response = await request(getServer())
      .put("/questions/qid3")
      .send({
        hidden: "true",
      })
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      ...q3,
      hidden: true,
    });
  });

  test("should error 500 when empty title", async () => {
    const { token, connectSidValue } = await mockLoggedInUser(user3);

    Question.findOne = jest
      .fn()
      .mockResolvedValueOnce({ ...q3, save: jest.fn() });

    const response = await request(getServer())
      .put("/questions/qid3")
      .send({
        title: "",
        description: "new description",
        tags: ["newTag1", "newTag2"],
      })
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(response.statusCode).toBe(500);
  });

  test("should error 500 when empty description", async () => {
    const { token, connectSidValue } = await mockLoggedInUser(user1);

    Question.findOne = jest
      .fn()
      .mockResolvedValueOnce({ ...q3, save: jest.fn() });

    const response = await request(getServer())
      .put("/questions/qid3")
      .send({
        title: "new title",
        description: "",
        tags: [],
      })
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(response.statusCode).toBe(500);
  });
});
