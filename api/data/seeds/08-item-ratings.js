exports.seed = function (knex) {
  return knex("item_ratings")
    .del()
    .then(function () {
      return knex("item_ratings").insert([
        {
          user_id: 1,
          item_id: 1,
          item_rating: 4,
        },
        {
          user_id: 2,
          item_id: 1,
          item_rating: 1,
        },
        {
          user_id: 3,
          item_id: 1,
          item_rating: 5,
        },
        {
          user_id: 1,
          item_id: 2,
          item_rating: 4,
        },
        {
          user_id: 2,
          item_id: 2,
          item_rating: 2,
        },
        {
          user_id: 3,
          item_id: 2,
          item_rating: 2,
        },
        {
          user_id: 1,
          item_id: 3,
          item_rating: 5,
        },
        {
          user_id: 2,
          item_id: 3,
          item_rating: 3,
        },
        {
          user_id: 3,
          item_id: 4,
          item_rating: 2,
        },
      ]);
    });
};
