const router = require("express").Router();
const { restrictedId } = require("../auth/auth-middleware");
const User = require("./users-model");

router.get("/:id", restrictedId, (req, res, next) => {
  try {
    return res.json({ message: "GET users/:id endpoint is up" });
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
