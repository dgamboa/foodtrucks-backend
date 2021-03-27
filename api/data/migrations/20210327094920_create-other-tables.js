exports.up = async function (knex) {
  await knex.schema
    .createTable("trucks", (trucks) => {
      trucks.increments("truck_id");
      trucks.string("truck_name", 200).notNullable();
      trucks.string("truck_description", 200).notNullable();
      trucks.float("truck_lat");
      trucks.float("truck_long");
      trucks.time("open_time").notNullable();
      trucks.time("close_time").notNullable();
      trucks.string("image_url");
      trucks.string("cuisine", 200).notNullable();
      trucks
        .integer("user_id")
        .unsigned()
        .notNullable()
        .references("user_id")
        .inTable("users")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      trucks.timestamps(false, true);
    })
    .createTable("items", (items) => {
      items.increments("item_id");
      items.string("item_name", 200).notNullable();
      items.string("item_description", 200);
      items.decimal("item_price").notNullable();
      items
        .integer("truck_id")
        .unsigned()
        .notNullable()
        .references("truck_id")
        .inTable("trucks")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
    })
    .createTable("favorites", (favorites) => {
      favorites.increments("favorite_id");
      favorites
        .integer("user_id")
        .unsigned()
        .notNullable()
        .references("user_id")
        .inTable("users")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      favorites
        .integer("truck_id")
        .unsigned()
        .notNullable()
        .references("truck_id")
        .inTable("trucks")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
    })
    .createTable("item_photos", (photos) => {
      photos.increments("photo_id");
      photos.string("photo_url").notNullable();
      photos
        .integer("item_id")
        .unsigned()
        .notNullable()
        .references("item_id")
        .inTable("items")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
    })
    .createTable("truck_ratings", (rating) => {
      rating.increments("truck_rating_id");
      rating.integer("truck_rating").notNullable();
      rating
        .integer("truck_id")
        .unsigned()
        .notNullable()
        .references("truck_id")
        .inTable("trucks")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
    })
    .createTable("item_ratings", (rating) => {
      rating.increments("item_rating_id");
      rating.integer("item_rating").notNullable();
      rating
        .integer("user_id")
        .unsigned()
        .notNullable()
        .references("user_id")
        .inTable("users")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      rating
        .integer("item_id")
        .unsigned()
        .notNullable()
        .references("item_id")
        .inTable("items")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
    })
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("item_ratings");
  await knex.schema.dropTableIfExists("truck_ratings");
  await knex.schema.dropTableIfExists("item_photos");
  await knex.schema.dropTableIfExists("favorites");
  await knex.schema.dropTableIfExists("items");
  await knex.schema.dropTableIfExists("trucks");
};
