const db = require("../data/db-config");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../secrets");

module.exports = {
  checkUsernameAvailable,
  checkValidBody,
  buildToken,
  restricted,
  restrictedUserId,
  restrictedTruckId,
};

function checkValidBody(req, res, next) {
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

function restrictedUserId(req, res, next) {
  const tokenId = req.decodedJWT.subject;
  const paramsId = parseInt(req.params.user_id);

  tokenId === paramsId
    ? next()
    : res.status(401).json({ message: "invalid credentials" });
}

async function restrictedTruckId(req, res, next) {
  const tokenId = req.decodedJWT.subject;
  const truckId = parseInt(req.params.truck_id);

  const truckRecord = await db("trucks").where("truck_id", truckId).first();
  truckRecord.user_id === tokenId
    ? next()
    : res.status(401).json({ message: "invalid credentials" });
}
