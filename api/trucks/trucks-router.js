const router = require("express").Router();
// const { validate } = require("./companies-middleware");
const Truck = require("./trucks-model");

router.get("/", (req, res, next) => {
  try {
    return res.json({message: "GET trucks endpoint is up"})
  } catch(err) { next(err) }
});

router.use((err, req, res) => {
  res.status(500).json({
    error: err.message,
    stack: err.stack,
  });
});

module.exports = router;
