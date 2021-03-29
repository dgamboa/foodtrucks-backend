const mockTrucks = [
  {
    truck_id: 1,
    truck_name: "Salty",
    truck_description: "Best BBQ!",
    image_url:
      "https://images.unsplash.com/photo-1570642916889-e95abeda9813?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=634&q=80",
    truck_lat: 43.4783,
    truck_long: -110.7697,
    open_time: "10:30:00",
    close_time: "21:00:00",
    cuisine: "BBQ",
    number_of_ratings: 3,
    truck_avg_rating: 4.35,
  },
  {
    truck_id: 2,
    truck_name: "Brisk It",
    truck_description: "Just another BBQ joint!",
    image_url:
      "https://images.unsplash.com/photo-1505826759037-406b40feb4cd?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1052&q=80",
    truck_lat: 43.4729,
    truck_long: -110.761,
    open_time: "10:00:00",
    close_time: "20:00:00",
    cuisine: "BBQ",
    number_of_ratings: 2,
    truck_avg_rating: 4.5,
  },
  {
    truck_id: 3,
    truck_name: "Burgerz",
    truck_description: "Burgers and more!",
    image_url:
      "https://images.unsplash.com/photo-1570642916889-e95abeda9813?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=634&q=80",
    truck_lat: 43.4752,
    truck_long: -110.7669,
    open_time: "11:15:00",
    close_time: "21:15:00",
    cuisine: "American",
    number_of_ratings: 3,
    truck_avg_rating: 4.35,
  },
  {
    truck_id: 4,
    truck_name: "Bourgeois",
    truck_description: "Burgers, sandwiches and fries... maybe some ice cream!",
    image_url:
      "https://images.unsplash.com/photo-1505826759037-406b40feb4cd?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1052&q=80",
    truck_lat: 43.4745,
    truck_long: -110.7815,
    open_time: "10:00:00",
    close_time: "20:00:00",
    cuisine: "American",
    number_of_ratings: 2,
    truck_avg_rating: 4.5,
  },
];

const mockUser = {
  user_id: 1,
  username: "roger",
  email: "roger@mock.com",
  user_lat: 43.4799,
  user_long: -110.7624,
  favorite_trucks: [
    mockTrucks[0],
    mockTrucks[1],
  ],
  trucks_owned: [
    mockTrucks[2],
    mockTrucks[3],
  ],
};

module.exports = {
  mockUser,
  mockTrucks
};
