module.exports = { checkValidTruck };

function checkValidTruck(req, res, next) {
  const {
    truck_name,
    truck_description,
    open_time,
    close_time,
    cuisine,
  } = req.body;

  if (truck_name && truck_description && open_time && close_time && cuisine) {
    next();
  } else {
    res
      .status(422)
      .json({
        message:
          "trucks require name, description, open and close times, and cuisine type",
      });
  }
}
