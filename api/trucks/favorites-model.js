const db = require("../data/db-config");

function create(favorite) {
  return db("favorites").insert(favorite, [
    "favorite_id",
    "truck_id",
    "user_id",
  ]);
}

module.exports = { create };
