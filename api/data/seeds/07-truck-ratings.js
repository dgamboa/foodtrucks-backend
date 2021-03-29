exports.seed = function (knex) {
  return knex("truck_ratings")
    .del()
    .then(function () {
      return knex("truck_ratings").insert([
        {
          truck_id: 1,
          user_id: 1,
          truck_rating: 4,
        },
        {
          truck_id: 1,
          user_id: 2,
          truck_rating: 5,
        },
        {
          truck_id: 1,
          user_id: 3,
          truck_rating: 4,
        },
        {
          truck_id: 2,
          user_id: 1,
          truck_rating: 1,
        },
        {
          truck_id: 2,
          user_id: 2,
          truck_rating: 5,
        },
      ]);
    });
};
