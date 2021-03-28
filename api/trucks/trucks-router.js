const router = require("express").Router();
const { checkValidTruck, checkTruckExists } = require("../middleware");
const { restrictedTruckId } = require("../auth/auth-middleware");
const Truck = require("./trucks-model");

router.get("/", async (req, res, next) => {
  try {
    const trucks = await Truck.getAll();
    res.json(trucks);
  } catch (err) {
    next(err);
  }
});

router.post("/", checkValidTruck, async (req, res, next) => {
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

router.delete("/:truck_id", checkTruckExists, restrictedTruckId, async (req, res, next) => {
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
});

router.use((err, req, res, next) => {
  res.status(500).json({
    error: err.message,
    stack: err.stack,
  });
});

module.exports = router;
