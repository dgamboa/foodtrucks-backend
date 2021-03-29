exports.seed = function (knex) {
  return knex("item_photos")
    .del()
    .then(function () {
      return knex("item_photos").insert([
        {
          photo_url:
            "https://images.unsplash.com/photo-1560781290-7dc94c0f8f4f?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=750&q=80",
          item_id: 1,
        },
        {
          photo_url:
            "https://images.unsplash.com/photo-1432139509613-5c4255815697?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=632&q=80",
          item_id: 1,
        },
        {
          photo_url:
            "https://images.unsplash.com/photo-1532550907401-a500c9a57435?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
          item_id: 2,
        },
        {
          photo_url:
            "https://images.unsplash.com/photo-1516684669134-de6f7c473a2a?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80",
          item_id: 2,
        },
        {
          photo_url:
            "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=750&q=80",
          item_id: 3,
        },
        {
          photo_url:
            "https://images.unsplash.com/photo-1550547660-d9450f859349?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=802&q=80",
          item_id: 4,
        },
        {
          photo_url:
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1100&q=80",
          item_id: 5,
        },
      ]);
    });
};
