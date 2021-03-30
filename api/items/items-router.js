const router = require("express").Router();
const { checkValidItem } = require("../middleware");
const { restrictedUserId } = require("../auth/auth-middleware");
const Item = require("./items-model");

router.post("/", checkValidItem, restrictedUserId, async (req, res, next) => {
  const itemToCreate = req.body;

  try {
    const itemCreated = await Item.create(itemToCreate);
    res
      .status(201)
      .json({ item: itemCreated, message: "item successfully created!" });
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
