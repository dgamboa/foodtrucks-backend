const db = require("../data/db-config");

module.exports = { checkValidTruck, checkTruckExists, checkValidUserEdit };

function checkValidUserEdit(req, res, next) {
  const { email, user_lat, user_long } = req.body;

  if (email || user_lat || user_long) {
    req.userEdits = {
      email,
      user_lat,
      user_long,
    };
    next();
  } else {
    res.status(422).json({
      message:
        "user edits require a change to email, user_lat and/or user_long",
    });
  }
}

function checkValidTruck(req, res, next) {
  const {
    truck_name,
    truck_description,
    open_time,
    close_time,
    cuisine,
    user_id,
  } = req.body;

  if (
    truck_name &&
    truck_description &&
    open_time &&
    close_time &&
    cuisine &&
    user_id
  ) {
    next();
  } else {
    res.status(422).json({
      message: "truck creation failed due to invalid truck object",
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
