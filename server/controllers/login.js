const express = require("express");
const User = require("../models/user");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, password, role } = req.body;

  if (
    username == "" ||
    password == "" ||
    (role != "admin" && role != "poster")
  ) {
    return res
      .status(401)
      .send(
        "Neither username nor password may be empty. Role must be `Admin` or `Poster`"
      );
  } else {
    const user = await User.findOne({ username: username.toLowerCase() });

    if (user) {
      return res.status(401).send("A user with this username already exists");
    } else {
      const newUser = await User.create({
        username: username.toLowerCase(),
        password: password,
        role: role,
      });
      return res.status(200).json(newUser);
    }
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({
    username: username.toLowerCase(),
    password: password,
  });

  if (user) {
    req.session.user = user;
    return res.json({ success: true, user });
  } else {
    return res.status(401).send("Incorrect username or password.");
  }
});

// Logout route
router.post("/logout", (req, res) => {
  req.session.destroy();
  return res.json({ success: true });
});

// Check login status route
router.get("/check-login", (req, res) => {
  const user = req.session.user;
  return res.status(200).json({ loggedIn: !!user, user });
});

module.exports = router;
