const db = require("../data/db-config");

function create(favorite) {
  return db("favorites").insert(favorite, [
    "favorite_id",
    "truck_id",
    "user_id",
  ]);
}

async function remove(favorite_id) {
  const favoriteToDelete = await getFavoriteById(favorite_id);
  await db("favorites").where("favorite_id", favorite_id).del();
  return favoriteToDelete;
}

function getFavoriteById(favorite_id) {
  return db("favorites").where("favorite_id", favorite_id).first();
}

module.exports = { create, remove };
