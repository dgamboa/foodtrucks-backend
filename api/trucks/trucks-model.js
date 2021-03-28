const db = require("../data/db-config");

module.exports = { create, getAll };

async function getAll() {
  return db("trucks").limit(20);
}

function getById(truck_id) {}

async function create(truck) {
  return db("trucks").insert(truck, [
    "truck_id",
    "truck_name",
    "truck_description",
    "open_time",
    "close_time",
    "cuisine",
    "user_id",
  ]);
}
