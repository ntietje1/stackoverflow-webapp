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

const { user1, user3 } = require("./testData");

describe("POST /login", () => {
  beforeEach(() => {
    startServer();
  });

  afterEach(async () => {
    stopServer();
    await mongoose.disconnect();
  });

  it("login should return a user if the user is valid, has a session, and a token", async () => {
    // Request CSRF token
    const respToken = await request(getServer()).get("/csrf-token");

    // Extract CSRF token from response body
    const token = respToken.body.csrfToken;

    // Extract connect.sid cookie value from response headers
    let connectSidValue = null;
    respToken.headers["set-cookie"].forEach((cookie) => {
      if (cookie.includes("connect.sid")) {
        connectSidValue = cookie.split("=")[1].split(";")[0];
      }
    });

    User.findOne = jest.fn().mockResolvedValueOnce(user1);

    // Send login request with fake user credentials, CSRF token, and session cookie
    const respLogin = await request(getServer())
      .post("/login")
      .send(user1)
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    // Assert that the login request was successful
    expect(respLogin.status).toBe(200);

    // Assert that the response body contains the expected user object
    expect(respLogin.body.user.username).toBe(user1.username);
    expect(respLogin.body.user.password).toBe(user1.password);
  });

  it("login should return 401 status if the user gives invalid password, has a session, and a token", async () => {
    const respToken = await request(getServer()).get("/csrf-token");

    const token = respToken.body.csrfToken;
    let connectSidValue = null;
    respToken.headers["set-cookie"].forEach((cookie) => {
      if (cookie.includes("connect.sid")) {
        connectSidValue = cookie.split("=")[1].split(";")[0];
      }
    });

    User.findOne = jest.fn().mockResolvedValueOnce(undefined);

    const respLogin = await request(getServer())
      .post("/login")
      .send(user1)
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(respLogin.status).toBe(401);
  });

  it("login should return 403 forbidden if the user is valid but has no token", async () => {
    const respToken = await request(getServer()).get("/csrf-token");

    let connectSidValue = null;
    respToken.headers["set-cookie"].forEach((cookie) => {
      if (cookie.includes("connect.sid")) {
        connectSidValue = cookie.split("=")[1].split(";")[0];
      }
    });

    User.findOne = jest.fn().mockResolvedValueOnce(user1);

    const respLogin = await request(getServer())
      .post("/login")
      .send(user1)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);
    expect(respLogin.status).toBe(403);
  });

  it("login should return 403 forbidden if the user is valid but has no session", async () => {
    const respToken = await request(getServer()).get("/csrf-token");

    const token = respToken.body.csrfToken;

    User.findOne = jest.fn().mockResolvedValueOnce(user1);

    const respLogin = await request(getServer())
      .post("/login")
      .send(user1)
      .set("x-csrf-token", token);
    expect(respLogin.status).toBe(403);
  });
});

describe("POST /register", () => {
  beforeEach(() => {
    startServer();
  });

  afterEach(async () => {
    stopServer();
    await mongoose.disconnect();
  });

  it("register must return a new user if the username, password, and role are valid", async () => {
    const { token, connectSidValue } = await mockSession();

    User.findOne = jest.fn().mockResolvedValueOnce(null);
    User.create = jest.fn().mockResolvedValueOnce(user1);

    const respRegister = await request(getServer())
      .post("/register")
      .send(user1)
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(respRegister.status).toBe(200);
    expect(respRegister.body.username).toBe(user1.username);
  });

  it("register should return 401 status if the username already exists", async () => {
    const { token, connectSidValue } = await mockSession();

    User.findOne = jest.fn().mockResolvedValueOnce(user1);

    const respRegister = await request(getServer())
      .post("/register")
      .send(user1)
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(respRegister.status).toBe(401);
  });

  it("register should return 401 if username empty", async () => {
    const { token, connectSidValue } = await mockSession();

    const respRegister = await request(getServer())
      .post("/register")
      .send({ username: "", password: "password", role: "poster" })
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(respRegister.status).toBe(401);
  });

  it("register should return 401 if password empty", async () => {
    const { token, connectSidValue } = await mockSession();

    const respRegister = await request(getServer())
      .post("/register")
      .send({ username: "uhasfk", password: "", role: "poster" })
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(respRegister.status).toBe(401);
  });
});

describe("POST /logout", () => {
  beforeEach(() => {
    startServer();
  });

  afterEach(async () => {
    stopServer();
    await mongoose.disconnect();
  });

  it("logout should return success true if logged in", async () => {
    const { token, connectSidValue } = await mockLoggedInUser(user1);
    const respLogout = await request(getServer())
      .post("/logout")
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(respLogout.status).toBe(200);
    expect(respLogout.body.success).toBe(true);
  });

  it("logout should return success even if logged out already", async () => {
    const { token, connectSidValue } = await mockSession();
    const respLogout = await request(getServer())
      .post("/logout")
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(respLogout.status).toBe(200);
    expect(respLogout.body.success).toBe(true);
  });
});

describe("GET /check-login", () => {
  beforeEach(() => {
    startServer();
  });

  afterEach(async () => {
    stopServer();
    await mongoose.disconnect();
  });
  it("GET /check-login must return loggedIn true if the user is logged in", async () => {
    const { token, connectSidValue } = await mockLoggedInUser(user3);
    const respCheckLogin = await request(getServer())
      .get("/check-login")
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(respCheckLogin.status).toBe(200);
    expect(respCheckLogin.body.loggedIn).toBe(true);
  });

  it("GET /check-login must return loggedIn false if the user is not logged in (session)", async () => {
    const { token, connectSidValue } = await mockSession();
    const respCheckLogin = await request(getServer())
      .get("/check-login")
      .set("x-csrf-token", token)
      .set("Cookie", [`connect.sid=${connectSidValue}`]);

    expect(respCheckLogin.status).toBe(200);
    expect(respCheckLogin.body.loggedIn).toBe(false);
  });

  it("GET /check-login must return loggedIn false if the user is not logged in (no session)", async () => {
    const respCheckLogin = await request(getServer()).get("/check-login");

    expect(respCheckLogin.status).toBe(200);
    expect(respCheckLogin.body.loggedIn).toBe(false);
  });
});
