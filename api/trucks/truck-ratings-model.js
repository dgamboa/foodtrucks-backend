const db = require("../data/db-config");

module.exports = { create };

function create(truckRating) {
  return db("truck_ratings").insert(truckRating, [
    "truck_rating_id",
    "truck_id",
    "user_id",
    "truck_rating",
  ]);
}
