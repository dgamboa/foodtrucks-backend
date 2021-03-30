const db = require("../data/db-config");
const { decimalize } = require("../middleware");

async function create(item) {
  const itemCreated = await db("items").insert(item, [
    "item_id",
    "item_name",
    "item_description",
    "item_price",
    "truck_id",
  ]);
  return {
    ...itemCreated[0],
    item_price: decimalize(itemCreated[0].item_price),
  };
}

async function edit(item_id, item) {
  const itemUpdated = await db("items")
    .where("item_id", item_id)
    .update(item, [
      "item_id",
      "item_name",
      "item_description",
      "item_price",
      "truck_id",
    ]);
  return {
    ...itemUpdated[0],
    item_price: decimalize(itemUpdated[0].item_price),
  };
}

module.exports = { create, edit };
