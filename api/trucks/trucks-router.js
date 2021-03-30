const router = require("express").Router();
const { checkValidTruck, checkTruckExists } = require("../middleware");
const { restrictedUserId } = require("../auth/auth-middleware");
const Truck = require("./trucks-model");

// Endpoints
router.get("/", async (req, res, next) => {
  try {
    const trucks = await Truck.getAll();
    res.json(trucks);
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

router.use((err, req, res, next) => {
  res.status(500).json({
    error: err.message,
    stack: err.stack,
  });
});

module.exports = router;
