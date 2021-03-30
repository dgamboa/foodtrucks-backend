const router = require("express").Router();
const { checkValidItem, checkItemExists } = require("../middleware");
const { restrictedUserId } = require("../auth/auth-middleware");
const Item = require("./items-model");
const Photo = require("./photos-model");

// Items
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

router.put(
  "/:item_id",
  checkValidItem,
  restrictedUserId,
  checkItemExists,
  async (req, res, next) => {
    const { item_id } = req.params;
    const item = req.body;

    try {
      const itemUpdated = await Item.edit(item_id, item);
      return res.status(200).json({
        item: itemUpdated,
        message: "item successfully updated!",
      });
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  "/:item_id",
  checkItemExists,
  restrictedUserId,
  async (req, res, next) => {
    const { item_id } = req.params;

    try {
      const itemRemoved = await Item.remove(item_id);
      res.json({
        message: `successfully deleted item with id ${item_id}`,
        item: itemRemoved,
      });
    } catch (err) {
      next(err);
    }
  }
);

// Photos
router.get("/", async (req, res, next) => {
  const { item_id } = req.params;
  console.log(req)

  try {
    const photos = await Photo.getAll(item_id);
    res.json(photos);
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
