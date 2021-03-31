const db = require("../data/db-config");

module.exports = { create, edit };

function create(itemRating) {
  return db("item_ratings").insert(itemRating, [
    "item_rating_id",
    "item_id",
    "user_id",
    "item_rating",
  ]);
}

function edit(item_rating_id, itemRating) {
  return db("item_ratings")
    .where("item_rating_id", item_rating_id)
    .update(itemRating, [
      "item_rating_id",
      "item_id",
      "user_id",
      "item_rating",
    ]);
}
