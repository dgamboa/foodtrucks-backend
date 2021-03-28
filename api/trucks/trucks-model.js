const db = require("../data/db-config");

module.exports = { create };

async function getAll() {}

function getById(truck_id) {
  
}

async function create(truck) {
  return db("trucks").insert(truck, [
    "truck_id",
    "truck_name",
    "truck_description",
    "open_time",
    "close_time",
    "cuisine",
    "user_id"
  ]);
}
