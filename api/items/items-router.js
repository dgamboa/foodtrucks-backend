const router = require("express").Router();
const {
  checkValidItem,
  checkItemExists,
  checkValidPhoto,
  checkPhotoExists,
} = require("../middleware");
const { restrictedUserId } = require("../auth/auth-middleware");
const Item = require("./items-model");
const Photo = require("./photos-model");
const ItemRating = require("./item-ratings-model");

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
router.get("/:item_id/photos", async (req, res, next) => {
  const { item_id } = req.params;
  const numberOfPhotos = req.query.limit;

  try {
    const photos = await Photo.getAll(item_id, numberOfPhotos);
    res.json(photos);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/:item_id/photos",
  checkValidPhoto,
  restrictedUserId,
  async (req, res, next) => {
    const photoToUpload = req.body;

    try {
      const photoUploaded = await Photo.upload(photoToUpload);
      res.status(201).json({
        photo: photoUploaded[0],
        message: "photo successfully uploaded!",
      });
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  "/:item_id/photos/:photo_id",
  checkPhotoExists,
  restrictedUserId,
  async (req, res, next) => {
    const { item_id, photo_id } = req.params;

    try {
      const photoRemoved = await Photo.remove(photo_id);
      res.json({
        message: `successfully deleted photo with id ${photo_id}`,
        photo: photoRemoved,
      });
    } catch (err) {
      next(err);
    }
  }
);

// Item Ratings
router.post(
  "/:item_id/item-ratings",
  checkValidItemRating,
  checkItemRatingIdsMatch,
  restrictedUserId,
  checkItemRatingExists,
  async (req, res, next) => {
    const itemRatingToCreate = req.body;
    try {
      const itemRatingCreated = await ItemRating.create(itemRatingToCreate);
      return res.status(201).json({
        rating: itemRatingCreated[0],
        message: "item rating successfully created!",
      });
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
