const db = require("../data/db-config");

module.exports = {
  getById,
  edit,
  getUserWithPassword,
  editPassword,
};

async function getById(user_id) {
  const userDetails = await getUserDetails(user_id);
  const favoriteTrucks = await getFavoriteTrucks(user_id);
  const trucksOwned = await getTrucksOwned(user_id);

  const user = {
    ...userDetails,
    favorite_trucks: favoriteTrucks,
    trucks_owned: trucksOwned,
  };

  return user;
}

function getUserWithPassword(user_id) {
  return db("users").where("user_id", user_id).first();
}

function editPassword(user_id, hash_password) {
  return db("users")
    .where("user_id", user_id)
    .update({ password: hash_password }, ["user_id"]);
}

function edit(user_id, user) {
  return db("users")
    .where("user_id", user_id)
    .update(user, ["user_id", "username", "email", "user_lat", "user_long"]);
}

// **Helper Methods**
function getUserDetails(user_id) {
  return db("users")
    .column("user_id", "username", "email", "user_lat", "user_long")
    .where("user_id", user_id)
    .first();
}

function getFavoriteTrucks(user_id) {
  return db("users as u")
    .leftJoin("favorites as f", "f.user_id", "u.user_id")
    .leftJoin("trucks as t", "t.truck_id", "f.truck_id")
    .column(
      "t.truck_id",
      "t.truck_name",
      "t.truck_description",
      "t.image_url",
      "t.truck_lat",
      "t.truck_long",
      "t.open_time",
      "t.close_time",
      "t.cuisine"
    )
    .where("u.user_id", user_id);
}

function getTrucksOwned(user_id) {
  return db("trucks")
    .column(
      "truck_id",
      "truck_name",
      "truck_description",
      "image_url",
      "truck_lat",
      "truck_long",
      "open_time",
      "close_time",
      "cuisine"
    )
    .where("user_id", user_id);
}
