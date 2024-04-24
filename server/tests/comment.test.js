const request = require("supertest");
const { default: mongoose } = require("mongoose");
const Question = require("../models/question");
const Comment = require("../models/comment");
const User = require("../models/user");
const {
  mockSession,
  mockLoggedInUser,
  startServer,
  stopServer,
  getServer,
} = require("./testUtils");

const {
  q1,
  q2,
  q3,
  q4,
  user1,
  user2,
  user3,
  tag1,
  tag2,
  tag3,
  com1,
  com2,
  com3,
} = require("./testData");
const { includes } = require("../controllers/question");

describe("GET /comment/:cid", () => {
  beforeEach(() => {
    startServer();
  });

  afterEach(async () => {
    stopServer();
    await mongoose.disconnect();
  });

  it("getCommentByCid should return a comment by cid", async () => {
    const { token, connectSidValue } = await mockLoggedInUser(user1);
    Comment.findOne = jest.fn().mockResolvedValueOnce(com1);
    User.findOne = jest.fn().mockResolvedValueOnce(user1);

    const resp = await request(getServer())
      .get(`/comments/${com1._id}`)
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      _id: com1._id,
      description: com1.text,
      username: com1.username,
    });
  });

  it("getCommentByCid should return a comment by cid2", async () => {
    const { token, connectSidValue } = await mockSession();
    Comment.findOne = jest.fn().mockResolvedValueOnce(com2);
    User.findOne = jest.fn().mockResolvedValueOnce(user2);

    const resp = await request(getServer())
      .get(`/comments/${com2._id}`)
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      _id: com2._id,
      description: com2.text,
      username: com2.username,
    });
  });

  it("getCommentByCid should return 404 when comment not found", async () => {
    const { token, connectSidValue } = await mockSession();
    Comment.findOne = jest.fn().mockResolvedValueOnce(null);
    User.findOne = jest.fn().mockResolvedValueOnce(null);

    const resp = await request(getServer())
      .get(`/comments/${com2._id}`)
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(resp.statusCode).toEqual(404);
  });
});

describe("POST /comment", () => {
  beforeEach(() => {
    startServer();
  });

  afterEach(async () => {
    stopServer();
    await mongoose.disconnect();
  });

  it("addComment should return error 404 if unexpected error", async () => {
    const { user, question } = { user: user1, question: q1 };
    const { token, connectSidValue } = await mockLoggedInUser(user);
    const newComment = {
      text: "new comment",
      username: user.username,
      post_date_time: new Date().toString(),
    };
    Question.findOne = jest.fn().mockResolvedValueOnce(question);
    Comment.create = jest.fn().mockResolvedValueOnce(newComment);
    User.findOne = jest.fn().mockImplementationOnce(() => {
      throw new Error();
    });
    question.save = jest.fn();
    user.save = jest.fn();

    const resp = await request(getServer())
      .post("/comments")
      .send({ qid: user._id, text: newComment.text })
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(resp.statusCode).toEqual(404);
  });

  it("addComment should return a new comment", async () => {
    const { user, question } = { user: user1, question: q1 };
    const { token, connectSidValue } = await mockLoggedInUser(user);
    const newComment = {
      text: "new comment",
      username: user.username,
      post_date_time: new Date().toString(),
    };
    Question.findOne = jest.fn().mockResolvedValueOnce(question);
    Comment.create = jest.fn().mockResolvedValueOnce(newComment);
    User.findOne = jest.fn().mockResolvedValueOnce(user);
    question.save = jest.fn();
    user.save = jest.fn();

    const resp = await request(getServer())
      .post("/comments")
      .send({ qid: user._id, text: newComment.text })
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual(newComment);
    expect(question.comments).toContain(newComment._id);
    expect(user.comment_ids).toContain(newComment._id);
    expect(question.save).toHaveBeenCalled();
    expect(user.save).toHaveBeenCalled();
  });

  it("addComment should return a new comment2", async () => {
    const { user, question } = { user: user2, question: q3 };
    const { token, connectSidValue } = await mockLoggedInUser(user);
    const newComment = {
      text: "new comment wow!!!!",
      username: user.username,
      post_date_time: new Date().toString(),
    };
    Question.findOne = jest.fn().mockResolvedValueOnce(question);
    Comment.create = jest.fn().mockResolvedValueOnce(newComment);
    User.findOne = jest.fn().mockResolvedValueOnce(user);
    question.save = jest.fn();
    user.save = jest.fn();

    const resp = await request(getServer())
      .post("/comments")
      .send({ qid: user._id, text: newComment.text })
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual(newComment);
    expect(question.comments).toContain(newComment._id);
    expect(user.comment_ids).toContain(newComment._id);
    expect(question.save).toHaveBeenCalled();
    expect(user.save).toHaveBeenCalled();
  });

  it("addComment should return error 500 when user not logged in", async () => {
    const { token, connectSidValue } = await mockSession();

    Question.findOne = jest.fn().mockResolvedValueOnce(q1);
    q1.save = jest.fn();
    user1.save = jest.fn();

    const resp = await request(getServer())
      .post("/comments")
      .send({ qid: user1._id, text: "this should fail!!" })
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(resp.statusCode).toEqual(500);
    expect(q1.save).toHaveBeenCalledTimes(0);
    expect(user1.save).toHaveBeenCalledTimes(0);
  });

  it("addComment should return error 404 when non-existent qid", async () => {
    const { token, connectSidValue } = await mockLoggedInUser(user3);

    Question.findOne = jest.fn().mockResolvedValueOnce(undefined);
    user3.save = jest.fn();

    const resp = await request(getServer())
      .post("/comments")
      .send({ qid: user3._id, text: "this should fail!!" })
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(resp.statusCode).toEqual(404);
    expect(user3.save).toHaveBeenCalledTimes(0);
  });
});

describe("PUT /comment/:cid", () => {
  beforeEach(() => {
    startServer();
  });

  afterEach(async () => {
    stopServer();
    await mongoose.disconnect();
  });

  it("editComment should return updated comment with changed text", async () => {
    const { token, connectSidValue } = await mockLoggedInUser(user1);
    const updatedComment = { ...com1, text: "new text" };
    User.findOne = jest.fn().mockResolvedValueOnce(user1);
    Comment.findOne = jest.fn().mockResolvedValueOnce(com1);
    Comment.findOneAndUpdate = jest.fn().mockResolvedValueOnce(updatedComment);

    const resp = await request(getServer())
      .put(`/comments/${com1._id}`)
      .send({ text: updatedComment.text })
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual(updatedComment);
  });

  it("editComment should return updated comment with changed hidden", async () => {
    const { token, connectSidValue } = await mockLoggedInUser(user1);
    const updatedComment = { ...com1, hidden: true };
    User.findOne = jest.fn().mockResolvedValueOnce(user1);
    Comment.findOne = jest.fn().mockResolvedValueOnce(com1);
    Comment.findOneAndUpdate = jest.fn().mockResolvedValueOnce(updatedComment);

    const resp = await request(getServer())
      .put(`/comments/${com1._id}`)
      .send({ hidden: updatedComment.hidden })
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual(updatedComment);
  });

  it("editComment should return error 500 when illegal change", async () => {
    const { token, connectSidValue } = await mockLoggedInUser(user1);
    const updatedComment = { ...com1, hidden: true, text: "new text" };
    User.findOne = jest.fn().mockResolvedValueOnce(user1);
    Comment.findOne = jest.fn().mockResolvedValueOnce(com1);
    Comment.findOneAndUpdate = jest.fn().mockResolvedValueOnce(updatedComment);

    const resp = await request(getServer())
      .put(`/comments/${com1._id}`)
      .send({ hidden: updatedComment.hidden, text: updatedComment.text })
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(resp.statusCode).toEqual(500);
  });

  it("editComment should return error 404 if unexpected error", async () => {
    const { token, connectSidValue } = await mockLoggedInUser(user1);
    const updatedComment = { ...com1, hidden: true };
    User.findOne = jest.fn().mockResolvedValueOnce(user1);
    Comment.findOne = jest.fn().mockResolvedValueOnce(com1);
    Comment.findOneAndUpdate = jest.fn().mockImplementationOnce(() => {
      throw new Error();
    });

    const resp = await request(getServer())
      .put(`/comments/${com1._id}`)
      .send({ hidden: updatedComment.hidden })
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(resp.statusCode).toEqual(404);
  });

  it("editComment should return error 500 when not logged in", async () => {
    const { token, connectSidValue } = await mockSession();
    const updatedComment = { ...com1, hidden: true, text: "new text" };
    User.findOne = jest.fn().mockResolvedValueOnce(user1);
    Comment.findOne = jest.fn().mockResolvedValueOnce(com1);
    Comment.findOneAndUpdate = jest.fn().mockResolvedValueOnce(updatedComment);

    const resp = await request(getServer())
      .put(`/comments/${com1._id}`)
      .send({ hidden: updatedComment.hidden, text: updatedComment.text })
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(resp.statusCode).toEqual(500);
  });

  it("editComment should return error 404 when nonexistent comment", async () => {
    const { token, connectSidValue } = await mockLoggedInUser(user2);
    User.findOne = jest.fn().mockResolvedValueOnce(user2);
    Comment.findOne = jest.fn().mockResolvedValueOnce(undefined);

    const resp = await request(getServer())
      .put(`/comments/${com1._id}`)
      .send({ text: "this should fail!!!!" })
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(resp.statusCode).toEqual(404);
  });

  it("editComment should return error 404 when not the user's comment", async () => {
    const { token, connectSidValue } = await mockLoggedInUser(user3);
    const updatedComment = { ...com1, hidden: true };
    User.findOne = jest.fn().mockResolvedValueOnce(user3);
    Comment.findOne = jest.fn().mockResolvedValueOnce(undefined);
    Comment.findOneAndUpdate = jest.fn().mockResolvedValueOnce(updatedComment);

    const resp = await request(getServer())
      .put(`/comments/${com1._id}`)
      .send({ text: "this should fail!!!!" })
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(resp.statusCode).toEqual(404);
  });
});

describe("PUT /comment/:cid/:vote", () => {
  beforeEach(() => {
    startServer();
  });

  afterEach(async () => {
    stopServer();
    await mongoose.disconnect();
  });

  it("vote should return error 500 if not logged in", async () => {
    const { token, connectSidValue } = await mockSession();

    const resp = await request(getServer())
      .put(`/comments/com1/up`)
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(resp.statusCode).toEqual(500);
  });

  it("vote should return error 500 if wrong vote string", async () => {
    const { user, com } = { user: user3, com: com1 };
    const { token, connectSidValue } = await mockLoggedInUser(user);

    Comment.findOne = jest.fn().mockResolvedValueOnce(com);
    User.findOne = jest.fn().mockResolvedValueOnce(user);
    user.save = jest.fn();
    com.save = jest.fn();

    const resp = await request(getServer())
      .put(`/comments/${com._id}/fail!!`)
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(resp.statusCode).toEqual(500);
  });

  it("vote should return error 404 if non-existent comment", async () => {
    const { token, connectSidValue } = await mockLoggedInUser(user1);

    Comment.findOne = jest.fn().mockResolvedValueOnce(undefined);
    User.findOne = jest.fn().mockResolvedValueOnce(user1);
    user1.save = jest.fn();

    const resp = await request(getServer())
      .put(`/comments/com69/up`)
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(resp.statusCode).toEqual(404);
  });

  it("upvote on non-upvoted comment -> +1 vote", async () => {
    const { user, com } = { user: user3, com: com1 };
    const { token, connectSidValue } = await mockLoggedInUser(user);

    const currentVotes = com.votes;

    const mockUser = {
      ...user,
      upvoted_cids: {
        ...user.upvoted_cids,
        includes: jest.fn().mockImplementationOnce((cid) => {
          return user.upvoted_cids.includes(cid);
        }),
        pull: jest.fn().mockImplementationOnce((cid) => {
          user.upvoted_cids = user.downvoted_cids.filter((id) => id !== cid);
        }),
        push: jest.fn().mockImplementationOnce((cid) => {
          user.upvoted_cids.push(cid);
        }),
      },
      downvoted_cids: {
        ...user.downvoted_cids,
        includes: jest.fn().mockImplementationOnce((cid) => {
          return user.downvoted_cids.includes(cid);
        }),
        pull: jest.fn().mockImplementationOnce((cid) => {
          user.downvoted_cids = user.downvoted_cids.filter((id) => id !== cid);
        }),
        push: jest.fn().mockImplementationOnce((cid) => {
          user.downvoted_cids.push(cid);
        }),
      },
      save: jest.fn(),
    };

    Comment.findOne = jest.fn().mockResolvedValueOnce(com);
    User.findOne = jest.fn().mockResolvedValueOnce(mockUser);
    com.save = jest.fn();

    const resp = await request(getServer())
      .put(`/comments/${com._id}/up`)
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(resp.statusCode).toEqual(200);
    expect(com.votes).toEqual(currentVotes + 1);
    expect(user.upvoted_cids).toContain(com._id);
    expect(user.downvoted_cids).not.toContain(com._id);
  });

  it("downvote on non-upvoted comment -> -1 vote", async () => {
    const { user, com } = { user: user3, com: com2 };
    const { token, connectSidValue } = await mockLoggedInUser(user);

    const currentVotes = com.votes;

    const mockUser = {
      ...user,
      upvoted_cids: {
        ...user.upvoted_cids,
        includes: jest.fn().mockImplementationOnce((cid) => {
          return user.upvoted_cids.includes(cid);
        }),
        pull: jest.fn().mockImplementationOnce((cid) => {
          user.upvoted_cids = user.downvoted_cids.filter((id) => id !== cid);
        }),
        push: jest.fn().mockImplementationOnce((cid) => {
          user.upvoted_cids.push(cid);
        }),
      },
      downvoted_cids: {
        ...user.downvoted_cids,
        includes: jest.fn().mockImplementationOnce((cid) => {
          return user.downvoted_cids.includes(cid);
        }),
        pull: jest.fn().mockImplementationOnce((cid) => {
          user.downvoted_cids = user.downvoted_cids.filter((id) => id !== cid);
        }),
        push: jest.fn().mockImplementationOnce((cid) => {
          user.downvoted_cids.push(cid);
        }),
      },
      save: jest.fn(),
    };

    Comment.findOne = jest.fn().mockResolvedValueOnce(com);
    User.findOne = jest.fn().mockResolvedValueOnce(mockUser);
    com.save = jest.fn();

    const resp = await request(getServer())
      .put(`/comments/${com._id}/down`)
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(resp.statusCode).toEqual(200);
    expect(com.votes).toEqual(currentVotes - 1);
    expect(user.downvoted_cids).toContain(com._id);
    expect(user.upvoted_cids).not.toContain(com._id);
  });

  it("upvote on upvoted comment -> -1 vote", async () => {
    const { user, com } = { user: user1, com: com2 };
    const { token, connectSidValue } = await mockLoggedInUser(user);

    const currentVotes = com.votes;

    const mockUser = {
      ...user,
      upvoted_cids: {
        ...user.upvoted_cids,
        includes: jest.fn().mockImplementationOnce((cid) => {
          return user.upvoted_cids.includes(cid);
        }),
        pull: jest.fn().mockImplementationOnce((cid) => {
          user.upvoted_cids = user.downvoted_cids.filter((id) => id !== cid);
        }),
        push: jest.fn().mockImplementationOnce((cid) => {
          user.upvoted_cids.push(cid);
        }),
      },
      downvoted_cids: {
        ...user.downvoted_cids,
        includes: jest.fn().mockImplementationOnce((cid) => {
          return user.downvoted_cids.includes(cid);
        }),
        pull: jest.fn().mockImplementationOnce((cid) => {
          user.downvoted_cids = user.downvoted_cids.filter((id) => id !== cid);
        }),
        push: jest.fn().mockImplementationOnce((cid) => {
          user.downvoted_cids.push(cid);
        }),
      },
      save: jest.fn(),
    };

    Comment.findOne = jest.fn().mockResolvedValueOnce(com);
    User.findOne = jest.fn().mockResolvedValueOnce(mockUser);
    com.save = jest.fn();

    const resp = await request(getServer())
      .put(`/comments/${com._id}/up`)
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(resp.statusCode).toEqual(200);
    expect(com.votes).toEqual(currentVotes - 1);
    expect(user.upvoted_cids).not.toContain(com._id);
    expect(user.downvoted_cids).not.toContain(com._id);
  });

  it("downvote on upvoted comment -> -2 vote", async () => {
    const user1a = { ...user1, upvoted_cids: [com1._id] };
    const { user, com } = { user: user1a, com: com1 };
    const { token, connectSidValue } = await mockLoggedInUser(user);

    const currentVotes = com.votes;

    console.log("user!!!: ", user);

    const mockUser = {
      ...user,
      upvoted_cids: {
        ...user.upvoted_cids,
        includes: jest.fn().mockImplementationOnce((cid) => {
          return user.upvoted_cids.includes(cid);
        }),
        pull: jest.fn().mockImplementationOnce((cid) => {
          user.upvoted_cids = user.downvoted_cids.filter((id) => id !== cid);
        }),
        push: jest.fn().mockImplementationOnce((cid) => {
          user.upvoted_cids.push(cid);
        }),
      },
      downvoted_cids: {
        ...user.downvoted_cids,
        includes: jest.fn().mockImplementationOnce((cid) => {
          return user.downvoted_cids.includes(cid);
        }),
        pull: jest.fn().mockImplementationOnce((cid) => {
          user.downvoted_cids = user.downvoted_cids.filter((id) => id !== cid);
        }),
        push: jest.fn().mockImplementationOnce((cid) => {
          user.downvoted_cids.push(cid);
        }),
      },
      save: jest.fn(),
    };

    Comment.findOne = jest.fn().mockResolvedValueOnce(com);
    User.findOne = jest.fn().mockResolvedValueOnce(mockUser);
    com.save = jest.fn();

    const resp = await request(getServer())
      .put(`/comments/${com._id}/down`)
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(resp.statusCode).toEqual(200);
    expect(com.votes).toEqual(currentVotes - 2);
    expect(user.downvoted_cids).toContain(com._id);
    expect(user.upvoted_cids).not.toContain(com._id);
  });

  it("upvote on downvoted comment -> +2 vote", async () => {
    const { user, com } = { user: user2, com: com2 };
    const { token, connectSidValue } = await mockLoggedInUser(user);

    const currentVotes = com.votes;

    const mockUser = {
      ...user,
      upvoted_cids: {
        ...user.upvoted_cids,
        includes: jest.fn().mockImplementationOnce((cid) => {
          return user.upvoted_cids.includes(cid);
        }),
        pull: jest.fn().mockImplementationOnce((cid) => {
          user.upvoted_cids = user.downvoted_cids.filter((id) => id !== cid);
        }),
        push: jest.fn().mockImplementationOnce((cid) => {
          user.upvoted_cids.push(cid);
        }),
      },
      downvoted_cids: {
        ...user.downvoted_cids,
        includes: jest.fn().mockImplementationOnce((cid) => {
          return user.downvoted_cids.includes(cid);
        }),
        pull: jest.fn().mockImplementationOnce((cid) => {
          user.downvoted_cids = user.downvoted_cids.filter((id) => id !== cid);
        }),
        push: jest.fn().mockImplementationOnce((cid) => {
          user.downvoted_cids.push(cid);
        }),
      },
      save: jest.fn(),
    };

    Comment.findOne = jest.fn().mockResolvedValueOnce(com);
    User.findOne = jest.fn().mockResolvedValueOnce(mockUser);
    com.save = jest.fn();

    const resp = await request(getServer())
      .put(`/comments/${com._id}/up`)
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(resp.statusCode).toEqual(200);
    expect(com.votes).toEqual(currentVotes + 2);
    expect(user.upvoted_cids).toContain(com._id);
    expect(user.downvoted_cids).not.toContain(com._id);
  });

  it("downvote on downvoted comment -> +1 vote", async () => {
    const { user, com } = { user: user2, com: com3 };
    const { token, connectSidValue } = await mockLoggedInUser(user);

    const currentVotes = com.votes;

    const mockUser = {
      ...user,
      upvoted_cids: {
        ...user.upvoted_cids,
        includes: jest.fn().mockImplementationOnce((cid) => {
          return user.upvoted_cids.includes(cid);
        }),
        pull: jest.fn().mockImplementationOnce((cid) => {
          user.upvoted_cids = user.downvoted_cids.filter((id) => id !== cid);
        }),
        push: jest.fn().mockImplementationOnce((cid) => {
          user.upvoted_cids.push(cid);
        }),
      },
      downvoted_cids: {
        ...user.downvoted_cids,
        includes: jest.fn().mockImplementationOnce((cid) => {
          return user.downvoted_cids.includes(cid);
        }),
        pull: jest.fn().mockImplementationOnce((cid) => {
          user.downvoted_cids = user.downvoted_cids.filter((id) => id !== cid);
        }),
        push: jest.fn().mockImplementationOnce((cid) => {
          user.downvoted_cids.push(cid);
        }),
      },
      save: jest.fn(),
    };

    Comment.findOne = jest.fn().mockResolvedValueOnce(com);
    User.findOne = jest.fn().mockResolvedValueOnce(mockUser);
    com.save = jest.fn();

    const resp = await request(getServer())
      .put(`/comments/${com._id}/down`)
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(resp.statusCode).toEqual(200);
    expect(com.votes).toEqual(currentVotes + 1);
    expect(user.downvoted_cids).not.toContain(com._id);
    expect(user.upvoted_cids).not.toContain(com._id);
  });
});

describe("GET /comment/:cid/check-vote", () => {
  beforeEach(() => {
    startServer();
  });

  afterEach(async () => {
    stopServer();
    await mongoose.disconnect();
  });

  it("checkvote on upvoted post should return upvote", async () => {
    const user1a = { ...user1, upvoted_cids: [com1._id] };
    const { token, connectSidValue } = await mockLoggedInUser(user1a);
    User.findOne = jest.fn().mockResolvedValueOnce(user1a);

    const resp = await request(getServer())
      .get(`/comments/${com1._id}/check-vote`)
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(resp.statusCode).toEqual(200);
    expect(resp.text).toEqual("up");
  });

  it("checkvote on downvoted post should return downvote", async () => {
    const { token, connectSidValue } = await mockLoggedInUser(user2);
    User.findOne = jest.fn().mockResolvedValueOnce(user2);

    const resp = await request(getServer())
      .get(`/comments/${com1._id}/check-vote`)
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(resp.statusCode).toEqual(200);
    expect(resp.text).toEqual("down");
  });

  it("checkvote on non-voted post should return none", async () => {
    const { token, connectSidValue } = await mockLoggedInUser(user3);
    User.findOne = jest.fn().mockResolvedValueOnce(user3);

    const resp = await request(getServer())
      .get(`/comments/${com3._id}/check-vote`)
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(resp.statusCode).toEqual(200);
    expect(resp.text).toEqual("none");
  });

  it("checkvote when not logged in should return none", async () => {
    const { token, connectSidValue } = await mockSession();
    User.findOne = jest.fn().mockResolvedValueOnce(undefined);

    const resp = await request(getServer())
      .get(`/comments/${com2._id}/check-vote`)
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(resp.statusCode).toEqual(200);
    expect(resp.text).toEqual("none");
  });
});
