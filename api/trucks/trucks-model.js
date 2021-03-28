const db = require("../data/db-config");

module.exports = { create, getAll, remove };

async function getAll() {
  return db("trucks").limit(20);
}

function getById(truck_id) {
  return db("trucks").where("truck_id", truck_id).first();
}

function create(truck) {
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

async function remove(truck_id) {
  const truckToDelete = await getById(truck_id);
  if (truckToDelete) {
    await db("trucks").where("truck_id", truck_id).delete();
  }
  return truckToDelete;
}
