const db = require("../data/db-config");

module.exports = {
  getById,
  edit,
};

async function getById(user_id) {
  const favoriteTrucks = await getFavoriteTrucks(user_id);
  const trucksOwned = await getTrucksOwned(user_id);

  const userObject = favoriteTrucks[0];

  const returnUser = {
    user_id: userObject.user_id,
    username: userObject.username,
    email: userObject.email,
    user_lat: userObject.user_lat,
    user_long: userObject.user_long,
    favorite_trucks: [],
    trucks_owned: [],
  };

  return returnUser;
}

function edit(user_id, user) {
  return db("users")
    .where("user_id", user_id)
    .update(user, ["user_id", "username", "email", "user_lat", "user_long"]);
}

// **Helper Methods**
// Returns an array of favorite trucks that includes the user info
async function getFavoriteTrucks(user_id) {
  return await db("users as u")
    .leftJoin("favorites as f", "f.user_id", "u.user_id")
    .leftJoin("trucks as t", "t.truck_id", "f.truck_id")
    .column(
      "u.user_id",
      "u.username",
      "u.email",
      "u.user_lat",
      "u.user_long",
      "t.truck_id",
      "t.truck_name",
      "t.cuisine"
    )
    .where("u.user_id", user_id);
}

// Returns an array of trucks owned
async function getTrucksOwned(user_id) {
  return await db("trucks")
    .column("user_id", "truck_id", "truck_name", "cuisine")
    .where("user_id", user_id);
}

// For trucks object
// .column(
//   "t.truck_id",
//   "t.truck_name",
//   "t.truck_description",
//   "t.image_url",
//   "t.truck_lat",
//   "t.truck_long",
//   "t.open_time",
//   "t.close_time",
//   "t.cuisine"
// )
