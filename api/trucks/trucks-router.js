const router = require("express").Router();
const { checkValidTruck } = require("../middleware");
const Truck = require("./trucks-model");

router.get("/", async (req, res, next) => {
  try {
    const trucks = await Truck.getAll();
    return res.json(trucks);
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

router.use((err, req, res) => {
  res.status(500).json({
    error: err.message,
    stack: err.stack,
  });
});

module.exports = router;
