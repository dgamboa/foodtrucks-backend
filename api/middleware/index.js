const db = require("../data/db-config");

module.exports = {
  checkValidTruck,
  checkTruckExists,
  checkValidUserEdit,
  checkValidItem,
  checkItemExists,
  checkValidPhoto,
  checkPhotoExists,
  checkValidTruckRating,
  checkTruckIdsMatch,
  checkTruckRatingExists,
  checkValidItemRating,
  checkItemIdsMatch,
  checkItemRatingExists,
  checkValidFavorite,
  checkFavoriteExists,
  decimalize,
};

function checkValidUserEdit(req, res, next) {
  const { email, user_lat, user_long } = req.body;

  if (email || user_lat || user_long) {
    req.userEdits = {
      email,
      user_lat,
      user_long,
    };
    next();
  } else {
    res.status(422).json({
      message:
        "user edits require a change to email, user_lat and/or user_long",
    });
  }
}

function checkValidTruck(req, res, next) {
  const {
    truck_name,
    truck_description,
    open_time,
    close_time,
    cuisine,
    user_id,
  } = req.body;

  if (
    truck_name &&
    truck_description &&
    open_time &&
    close_time &&
    cuisine &&
    user_id
  ) {
    next();
  } else {
    res.status(422).json({
      message: "truck creation failed due to invalid truck object",
    });
  }
}

async function checkTruckExists(req, res, next) {
  const { truck_id } = req.params;
  const truck = await db("trucks").where("truck_id", truck_id).first();
  truck
    ? next()
    : res
        .status(404)
        .json({ message: `could not find truck with id ${truck_id}` });
}

function checkValidItem(req, res, next) {
  const { item_name, item_description, item_price, truck_id } = req.body;

  if (item_name && item_description && item_price && truck_id) {
    next();
  } else {
    res.status(422).json({
      message: "item creation failed due to invalid item object",
    });
  }
}

async function checkItemExists(req, res, next) {
  const { item_id } = req.params;
  const item = await db("items").where("item_id", item_id).first();
  item
    ? next()
    : res
        .status(404)
        .json({ message: `could not find item with id ${item_id}` });
}

function checkValidPhoto(req, res, next) {
  const { photo_url, item_id, user_id } = req.body;

  if (photo_url && item_id && user_id) {
    next();
  } else {
    res.status(422).json({
      message: "photo upload failed due to invalid photo object",
    });
  }
}

async function checkPhotoExists(req, res, next) {
  const { photo_id } = req.params;
  const photo = await db("item_photos").where("photo_id", photo_id).first();
  photo
    ? next()
    : res
        .status(404)
        .json({ message: `could not find photo with id ${photo_id}` });
}

function checkValidTruckRating(req, res, next) {
  const { user_id, truck_id, truck_rating } = req.body;

  if (user_id && truck_id && truck_rating) {
    next();
  } else {
    res.status(422).json({
      message:
        "truck rating creation failed due to invalid truck rating object",
    });
  }
}

function checkTruckIdsMatch(req, res, next) {
  const truck_idBody = req.body.truck_id;
  const truck_idParams = parseInt(req.params.truck_id);

  if (truck_idBody === truck_idParams) {
    next();
  } else {
    res.status(422).json({
      message: "truck id in body must match params in path",
    });
  }
}

async function checkTruckRatingExists(req, res, next) {
  const { truck_id, user_id } = req.body;
  const { truck_rating_id } = req.params;

  if (req.method === "POST") {
    const truck_rating = await db("truck_ratings")
      .where("truck_id", truck_id)
      .andWhere("user_id", user_id)
      .first();
    truck_rating
      ? res.status(422).json({ message: "truck rating already exists" })
      : next();
  } else if (req.method === "PUT") {
    const truck_rating = await db("truck_ratings")
      .where("truck_rating_id", truck_rating_id)
      .first();
    truck_rating
      ? next()
      : res.status(404).json({
          message: `could not find truck rating with id ${truck_rating_id}`,
        });
  }
}

function checkValidItemRating(req, res, next) {
  const { user_id, item_id, item_rating } = req.body;

  if (user_id && item_id && item_rating) {
    next();
  } else {
    res.status(422).json({
      message: "item rating creation failed due to invalid item rating object",
    });
  }
}

function checkItemIdsMatch(req, res, next) {
  const item_idBody = req.body.item_id;
  const item_idParams = parseInt(req.params.item_id);

  if (item_idBody === item_idParams) {
    next();
  } else {
    res.status(422).json({
      message: "item id in body must match params in path",
    });
  }
}

async function checkItemRatingExists(req, res, next) {
  const { item_id, user_id } = req.body;
  const { item_rating_id } = req.params;

  if (req.method === "POST") {
    const item_rating = await db("item_ratings")
      .where("item_id", item_id)
      .andWhere("user_id", user_id)
      .first();
    item_rating
      ? res.status(422).json({ message: "item rating already exists" })
      : next();
  } else if (req.method === "PUT") {
    const item_rating = await db("item_ratings")
      .where("item_rating_id", item_rating_id)
      .first();
    item_rating
      ? next()
      : res.status(404).json({
          message: `could not find item rating with id ${item_rating_id}`,
        });
  }
}

function checkValidFavorite(req, res, next) {
  const { user_id, truck_id } = req.body;

  if (user_id && truck_id) {
    next();
  } else {
    res.status(422).json({
      message: "truck not added to favorites due to missing property",
    });
  }
}

async function checkFavoriteExists(req, res, next) {
  const { truck_id, user_id } = req.body;
  const { favorite_id } = req.params;

  if (req.method === "POST") {
    const favorite = await db("favorites")
      .where("truck_id", truck_id)
      .andWhere("user_id", user_id)
      .first();
    favorite
      ? res.status(422).json({ message: "truck favorite already exists" })
      : next();
  } else if (req.method === "PUT") {
    const favorite = await db("favorites")
      .where("favorite_id", favorite_id)
      .first();
    favorite
      ? next()
      : res.status(404).json({
          message: `could not find favorite with id ${favorite_id}`,
        });
  }
}

function decimalize(stringNum) {
  return stringNum ? parseFloat(parseFloat(stringNum).toFixed(2)) : null;
}
