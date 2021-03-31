const db = require("../data/db-config");

module.exports = { create };

function create(itemRating) {
  return db("item_ratings").insert(itemRating, [
    "item_rating_id",
    "item_id",
    "user_id",
    "item_rating",
  ]);
}
