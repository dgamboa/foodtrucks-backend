const db = require("../data/db-config");

function getAll(item_id, numberOfPhotos = 5) {
  return db("item_photos").where("item_id", item_id).limit(numberOfPhotos);
}

function upload(photo) {
  return db("item_photos").insert(photo, [
    "photo_id",
    "photo_url",
    "item_id",
    "user_id",
  ]);
}

async function remove(photo_id) {
  const photoToDelete = await getPhotoById(photo_id);
  await db("item_photos").where("photo_id", photo_id).del();
  return photoToDelete
}

function getPhotoById(photo_id) {
  return db("item_photos").where("photo_id", photo_id).first();
}

module.exports = { getAll, upload, remove };
