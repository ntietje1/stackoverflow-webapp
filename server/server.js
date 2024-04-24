// Application server

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");

const { MONGO_URL, CLIENT_URL, port } = require("./config");

mongoose.connect(MONGO_URL);

const app = express();

app.use(mongoSanitize());

app.use(
  cors({
    origin: CLIENT_URL,
    methods: "GET,HEAD,PUT,PATCH,DELETE,POST",
    preflightContinue: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -- Auth Section --
const session = require("express-session");
const bodyParser = require("body-parser");
const csurf = require("csurf");

// Set up middleware
app.use(bodyParser.json());
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

// Set up CSRF protection
app.use(csurf());
app.get("/csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// NOTE - Setup controllers

app.get("/", (_, res) => {
  res.send("Fake SO Server Dummy Endpoint");
  res.end();
});

const loginController = require("./controllers/login");
const userController = require("./controllers/user");
const questionController = require("./controllers/question");
const commentController = require("./controllers/comment");

app.use("/", loginController);
app.use("/users/", userController);
app.use("/questions/", questionController);
app.use("/comments/", commentController);

let server = app.listen(port, () => {
  console.log(`Server starts at http://localhost:${port}`);
});

process.on("SIGINT", () => {
  server.close();
  mongoose.disconnect();
  console.log("Server closed. Database instance disconnected");
  process.exit(0);
});

module.exports = server;
