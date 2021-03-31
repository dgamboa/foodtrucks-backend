const db = require("../data/db-config");

module.exports = { create, edit };

function create(truckRating) {
  return db("truck_ratings").insert(truckRating, [
    "truck_rating_id",
    "truck_id",
    "user_id",
    "truck_rating",
  ]);
}

function edit(truck_rating_id, truckRating) {
  return db("truck_ratings")
    .where("truck_rating_id", truck_rating_id)
    .update(truckRating, [
      "truck_rating_id",
      "truck_id",
      "user_id",
      "truck_rating",
    ]);
}
