exports.seed = function (knex) {
  return knex("items")
    .del()
    .then(function () {
      return knex("items").insert([
        {
          item_name: "Beef",
          item_description: "Best beef in town",
          item_price: 10,
          truck_id: 1,
        },
        {
          item_name: "Chicken",
          item_description: "Best chicken in town",
          item_price: 8,
          truck_id: 1,
        },
        {
          item_name: "Ribs",
          item_description: "Best ribs in town",
          item_price: 12,
          truck_id: 2,
        },
        {
          item_name: "Burger",
          item_description: "Best burger in town",
          item_price: 7.50,
          truck_id: 3,
        },
        {
          item_name: "Salad",
          item_description: "Best salad in town",
          item_price: 11,
          truck_id: 4,
        },
      ]);
    });
};
