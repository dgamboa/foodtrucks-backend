const router = require("express").Router();
const { restrictedUserId } = require("../auth/auth-middleware");
const { checkValidUserEdit } = require("../middleware");
const User = require("./users-model");

// Mocks
const { mockUser } = require("../data/mocks");

// Endpoints
router.get("/:user_id", restrictedUserId, async (req, res, next) => {
  const { user_id } = req.params;

  try {
    const user = await User.getById(user_id);
    res.json(user);
    // res.json(mockUser);
  } catch (err) {
    next(err);
  }
});

router.put("/:user_id", checkValidUserEdit, restrictedUserId, async (req, res, next) => {
  const { user_id } = req.params;

  try {
    const user = await User.edit(user_id, req.userEdits);
    return res.status(200).json({
      user: user[0],
      message: "user successfully updated!",
    });
    // res.json(mockUser);
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
