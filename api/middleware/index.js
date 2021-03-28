const db = require("../data/db-config");

module.exports = { checkValidTruck, checkTruckExists };

function checkValidTruck(req, res, next) {
  const {
    truck_name,
    truck_description,
    open_time,
    close_time,
    cuisine,
    user_id,
  } = req.body;

  const tokenId = req.decodedJWT.subject;

  if (
    truck_name &&
    truck_description &&
    open_time &&
    close_time &&
    cuisine &&
    user_id &&
    user_id === tokenId
  ) {
    next();
  } else {
    res.status(422).json({
      message:
        "truck creation failed due to invalid truck object",
    });
  }
}

async function checkTruckExists(req, res, next) {
  const { truck_id } = req.params;
  const truck = await db("trucks").where("truck_id", truck_id).first();
  truck
    ? next()
    : res
        .status(404)
        .json({ message: `could not find truck with id ${truck_id}` });
}
