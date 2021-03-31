const router = require("express").Router();
const {
  checkValidTruck,
  checkTruckExists,
  checkValidTruckRating,
  checkTruckIdsMatch,
  checkTruckRatingExists,
  checkValidFavorite,
  checkFavoriteExists,
} = require("../middleware");
const { restrictedUserId } = require("../auth/auth-middleware");
const Truck = require("./trucks-model");
const TruckRating = require("./truck-ratings-model");
const Favorite = require("./favorites-model");

// Trucks
router.get("/", async (req, res, next) => {
  const numberOfTrucks = req.query.limit;
  const truckName = req.query.name?.toLowerCase();

  try {
    const trucks = await Truck.getAll(numberOfTrucks, truckName);
    res.json(trucks);
  } catch (err) {
    next(err);
  }
});

router.get("/:truck_id", async (req, res, next) => {
  const { truck_id } = req.params;

  try {
    const truck = await Truck.getById(truck_id);
    res.json(truck);
  } catch (err) {
    next(err);
  }
});

router.post("/", checkValidTruck, restrictedUserId, async (req, res, next) => {
  const truckToCreate = req.body;
  try {
    const truckCreated = await Truck.create(truckToCreate);
    return res
      .status(201)
      .json({ truck: truckCreated[0], message: "truck successfully created!" });
  } catch (err) {
    next(err);
  }
});

router.delete(
  "/:truck_id",
  checkTruckExists,
  restrictedUserId,
  async (req, res, next) => {
    const { truck_id } = req.params;

    try {
      const truckRemoved = await Truck.remove(truck_id);
      res.json({
        message: `successfully deleted truck with id ${truck_id}`,
        truck: truckRemoved,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  "/:truck_id",
  checkValidTruck,
  restrictedUserId,
  checkTruckExists,
  async (req, res, next) => {
    const { truck_id } = req.params;
    const truck = req.body;

    try {
      const truckUpdated = await Truck.edit(truck_id, truck);
      return res.status(200).json({
        truck: truckUpdated[0],
        message: "truck successfully updated!",
      });
    } catch (err) {
      next(err);
    }
  }
);

// Truck Ratings
router.post(
  "/:truck_id/truck-ratings",
  checkValidTruckRating,
  checkTruckIdsMatch,
  restrictedUserId,
  checkTruckRatingExists,
  async (req, res, next) => {
    const truckRatingToCreate = req.body;
    try {
      const truckRatingCreated = await TruckRating.create(truckRatingToCreate);
      return res.status(201).json({
        rating: truckRatingCreated[0],
        message: "truck rating successfully created!",
      });
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  "/:truck_id/truck-ratings/:truck_rating_id",
  checkValidTruckRating,
  checkTruckIdsMatch,
  restrictedUserId,
  checkTruckRatingExists,
  async (req, res, next) => {
    const { truck_rating_id } = req.params;
    const truckRating = req.body;

    try {
      const truckRatingUpdated = await TruckRating.edit(
        truck_rating_id,
        truckRating
      );
      return res.status(200).json({
        rating: truckRatingUpdated[0],
        message: "truck rating successfully updated!",
      });
    } catch (err) {
      next(err);
    }
  }
);

// Truck Favorites
router.post(
  "/:truck_id/favorites",
  checkValidFavorite,
  checkTruckIdsMatch,
  restrictedUserId,
  checkFavoriteExists,
  async (req, res, next) => {
    const truckFavToCreate = req.body;
    try {
      const truckFavCreated = await Favorite.create(truckFavToCreate);
      return res.status(201).json({
        favorite: truckFavCreated[0],
        message: "truck successfully added to favorites!",
      });
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  "/:truck_id/favorites/:favorite_id",
  checkFavoriteExists,
  checkTruckExists,
  restrictedUserId,
  async (req, res, next) => {
    const { favorite_id } = req.params;
    
    try {
      const favoriteRemoved = await Favorite.remove(favorite_id);
      res.json({
        message: `successfully deleted favorite with id ${favorite_id}`,
        favorite: favoriteRemoved,
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
