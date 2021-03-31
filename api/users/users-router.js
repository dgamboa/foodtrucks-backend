const router = require("express").Router();
const bcrypt = require("bcryptjs");
const { restrictedUserId } = require("../auth/auth-middleware");
const { checkValidUserEdit } = require("../middleware");
const User = require("./users-model");

// Endpoints
router.get("/:user_id", restrictedUserId, async (req, res, next) => {
  const { user_id } = req.params;

  try {
    const user = await User.getById(user_id);
    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.put(
  "/:user_id",
  checkValidUserEdit,
  restrictedUserId,
  async (req, res, next) => {
    const { user_id } = req.params;

    try {
      const user = await User.edit(user_id, req.userEdits);
      return res.status(200).json({
        user: user[0],
        message: "user successfully updated!",
      });
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  "/:user_id/password",
  restrictedUserId,
  async (req, res, next) => {
    const { old_password, new_password } = req.body;
    const user_id = parseInt(req.params.user_id);

    try {
      const user = await User.getUserWithPassword(user_id);
      if (user && bcrypt.compareSync(old_password, user.password)) {

        const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 5;
        const hash = bcrypt.hashSync(new_password, rounds);

        const user_idUpdated = await User.editPassword(user_id, hash);
        user_idUpdated
          ? res.status(200).json({ message: "Password successfully updated!" })
          : res
              .status(500)
              .json({ message: "something went wrong, please try again" });
      } else {
        res.status(401).json({ message: "invalid credentials" });
      }
    } catch (err) {
      next(err);
    }
  }
);

router.use((err, req, res, next) => {
  res.status(500).json({
    error: err.message,
    stack: err.stack,
  });
});

module.exports = router;
