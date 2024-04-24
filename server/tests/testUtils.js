const User = require("../models/user");
const request = require("supertest");

let server;

async function mockSession() {
  // Request CSRF token
  const respToken = await request(server).get("/csrf-token");

  // Extract CSRF token from response body
  const token = respToken.body.csrfToken;

  // Extract connect.sid cookie value from response headers
  let connectSidValue = null;
  respToken.headers["set-cookie"].forEach((cookie) => {
    if (cookie.includes("connect.sid")) {
      connectSidValue = cookie.split("=")[1].split(";")[0];
    }
  });

  return { token, connectSidValue };
}

async function mockLoggedInUser(user) {
  const { token, connectSidValue } = await mockSession();

  User.findOne = jest.fn().mockResolvedValueOnce(user);

  await request(server)
    .post("/login")
    .send(user)
    .set("x-csrf-token", token)
    .set("Cookie", [`connect.sid=${connectSidValue}`]);

  return { token, connectSidValue };
}

const startServer = () => {
  server = require("../server");
};

const stopServer = () => {
  server.close();
};

const getServer = () => server;

module.exports = {
  mockSession,
  mockLoggedInUser,
  startServer,
  stopServer,
  getServer,
};
