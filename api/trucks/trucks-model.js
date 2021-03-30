const db = require("../data/db-config");
const { decimalize } = require("../middleware");

module.exports = { create, getAll, remove, edit, getById };

async function getAll() {
  const rawTrucks = await getTrucksWithRatings();
  const trucks = rawTrucks.map((truck) => {
    return {
      ...truck,
      number_of_ratings: parseInt(truck.number_of_ratings),
      truck_avg_rating: decimalize(truck.truck_avg_rating),
    };
  });
  return trucks;
}

async function getById(truck_id) {
  const truck = await getOneTruckWithRatings(truck_id);
  const rawItems = await getTruckItems(truck_id);

  const items = rawItems.map((item) => {
    return {
      ...item,
      item_price: decimalize(item.item_price),
    };
  });

  return {
    ...truck,
    number_of_ratings: parseInt(truck.number_of_ratings),
    truck_avg_rating: decimalize(truck.truck_avg_rating),
    items: items,
  };
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

function edit(truck_id, truck) {
  return db("trucks")
    .where("truck_id", truck_id)
    .update(truck, [
      "truck_id",
      "truck_name",
      "truck_description",
      "open_time",
      "close_time",
      "cuisine",
      "user_id",
    ]);
}

// Helper Methods
function getTrucksWithRatings() {
  return db("trucks as t")
    .leftJoin("truck_ratings as r", "t.truck_id", "r.truck_id")
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
    .count({ number_of_ratings: "r.truck_rating_id" })
    .avg({ truck_avg_rating: "r.truck_rating" })
    .groupBy("t.truck_id")
    .limit(20);
}

function getOneTruckWithRatings(truck_id) {
  return db("trucks as t")
    .leftJoin("truck_ratings as r", "t.truck_id", "r.truck_id")
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
    .count({ number_of_ratings: "r.truck_rating_id" })
    .avg({ truck_avg_rating: "r.truck_rating" })
    .groupBy("t.truck_id")
    .where("t.truck_id", truck_id)
    .first();
}

function getTruckItems(truck_id) {
  return db("items")
    .column("item_id", "item_name", "item_description", "item_price")
    .where("truck_id", truck_id);
}
