const hash1234 = "$2a$05$R1oagF4fTIDfz6Ykg.L/W.7qGxNW8o8LVVNVF32Wlj7VOEQOgbc0W";

exports.seed = function (knex) {
  return knex("users")
    .del()
    .then(function () {
      return knex("users").insert([
        {
          username: "jeff",
          password: hash1234,
          email: "jeff@example.com",
          user_lat: 43.4791,
          user_long: -110.7644,
        },
        {
          username: "bill",
          password: hash1234,
          email: "bill@example.com",
          user_lat: 43.4799,
          user_long: -110.7624,
        },
        {
          username: "clara",
          password: hash1234,
          email: "clara@example.com",
          user_lat: 43.479,
          user_long: -110.762,
        },
      ]);
    });
};
