const router = require("express").Router();
const { restrictedUserId } = require("../auth/auth-middleware");
const User = require("./users-model");

// Mocks
const { mockUser } = require("../data/mocks");

// Endpoints
router.get("/:user_id", restrictedUserId, async (req, res, next) => {
  const { user_id } = req.params;

  try {
    // const user = await User.getById(user_id);
    // res.json(user);
    res.json(mockUser);
  } catch (err) {
    next(err);
  }
});

router.put("/:user_id", restrictedUserId, async (req, res, next) => {
  const { user_id } = req.params;
  const userUpdate = req.body;

  try {
    // const user = await User.getById(user_id);
    // res.json(user);
    res.json(mockUser);
  } catch (err) {
    next(err);
  }
});

router.use((err, req, res, next) => {
  res.status(500).json({
    error: err.message,
    stack: err.stack,
  });
});

module.exports = router;
