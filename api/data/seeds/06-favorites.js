exports.seed = function (knex) {
  return knex("favorites")
    .del()
    .then(function () {
      return knex("favorites").insert([
        {
          truck_id: 1,
          user_id: 1
        },
        {
          truck_id: 2,
          user_id: 1
        },
        {
          truck_id: 2,
          user_id: 2
        },
        {
          truck_id: 3,
          user_id: 2
        },
        {
          truck_id: 1,
          user_id: 3
        },
        {
          truck_id: 3,
          user_id: 3
        },
        {
          truck_id: 4,
          user_id: 3
        },
      ]);
    });
};
