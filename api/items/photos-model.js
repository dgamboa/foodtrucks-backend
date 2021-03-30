const db = require("../data/db-config");

function getAll(item_id) {
  return db("item_photos").where("item_id", item_id);
}

module.exports = { getAll };
