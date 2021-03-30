const db = require("../data/db-config");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../secrets");

module.exports = {
  checkUsernameAvailable,
  checkValidUser,
  buildToken,
  restricted,
  restrictedUserId,
};

function checkValidUser(req, res, next) {
  const { username, email, password } = req.body;
  const action = req.url;

  if (action === "/register" && (!username || !email || !password)) {
    res.status(422).json({ message: "username, email and password required" });
  } else if (action === "/login" && (!username || !password)) {
    res.status(422).json({ message: "username and password required" });
  } else if (typeof password !== "string") {
    res.status(422).json({ message: "password must be a string" });
  } else {
    next();
  }
}

async function checkUsernameAvailable(req, res, next) {
  const { username } = req.body;
  const user = await db("users").where("username", username).first();
  if (user) {
    res.status(422).json({ message: "username taken" });
  } else {
    next();
  }
}

function buildToken(user) {
  const payload = {
    subject: user.user_id,
    username: user.username,
  };
  const config = {
    expiresIn: "1d",
  };
  return jwt.sign(payload, JWT_SECRET, config);
}

function restricted(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    res.status(401).json({ message: "token required" });
  } else {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        res.status(401).json({ message: "token invalid" });
      } else {
        req.decodedJWT = decoded;
        next();
      }
    });
  }
}

async function restrictedUserId(req, res, next) {
  const tokenId = req.decodedJWT.subject;
  let user_id = parseInt(req.params.user_id) || req.body.user_id;
  let truck_id = parseInt(req.params.truck_id) || req.body.truck_id;
  let item_id = parseInt(req.params.item_id);

  if (!truck_id && item_id) {
    const truckRecord = await db("trucks as t")
      .leftJoin("items as i", "t.truck_id", "i.truck_id")
      .where("i.item_id", item_id)
      .select("t.truck_id", "t.user_id")
      .first();
    user_id = truckRecord.user_id;
  }

  if (!user_id) {
    const truckRecord = await db("trucks").where("truck_id", truck_id).first();
    user_id = truckRecord.user_id;
  }

  tokenId === user_id
    ? next()
    : res.status(401).json({ message: "invalid credentials" });
}
