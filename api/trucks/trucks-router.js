const router = require("express").Router();
const { restrictedId } = require("../auth/auth-middleware");
const { checkValidTruck } = require("../middleware");
const Truck = require("./trucks-model");

router.get("/", restrictedId, (req, res, next) => {
  try {
    return res.json({ message: "GET trucks endpoint is up" });
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
