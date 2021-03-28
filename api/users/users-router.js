const router = require("express").Router();
const { restrictedId } = require("../auth/auth-middleware");
const User = require("./users-model");

router.get("/:user_id", restrictedId, async (req, res, next) => {
  const { user_id } = req.params;

  try {
    const user = await User.getById(user_id);
    res.json(user);
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
