const router = require("express").Router();
const {
  checkUsernameAvailable,
  checkValidUser,
  buildToken,
} = require("./auth-middleware");
const bcrypt = require("bcryptjs");
const db = require("../data/db-config");

router.post(
  "/register",
  checkValidUser,
  checkUsernameAvailable,
  async (req, res, next) => {
    const credentials = req.body;
    const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 5;
    const hash = bcrypt.hashSync(credentials.password, rounds);
    credentials.password = hash;

    try {
      await db("users").insert(credentials);
      const user = await db("users")
        .where("username", credentials.username)
        .first();
      const token = buildToken(user);
      const registered = {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
      };
      res.status(201).json({ message: `Welcome ${registered.username}!`, token, registered });
    } catch (err) {
      next(err);
    }
  }
);

router.post("/login", checkValidUser, async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const user = await db("users").where("username", username).first();
    if (user && bcrypt.compareSync(password, user.password)) {
      const token = buildToken(user);
      const loggedIn = {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
      };
      res.status(200).json({ message: `Welcome ${username}!`, token, loggedIn });
    } else {
      res.status(401).json({ message: "invalid credentials" });
    }
  } catch (err) {
    next(err);
  }
});

router.use((err, req, res) => {
  res.status(500).json({
    error: err.message,
    stack: err.stack,
  });
});

module.exports = router;
