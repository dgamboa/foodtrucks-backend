const request = require("supertest");
const server = require("../server");
const db = require("../data/db-config");

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});

beforeEach(async () => {
  await db.seed.run();
});

afterAll(async () => {
  await db.destroy();
});

test("sanity", () => {
  expect(true).toBe(true);
});

describe("items", () => {
  describe("[POST] /api/items", () => {
    it("[1] requests without a token are rejected with right status and message", async () => {
      const res = await request(server).post("/api/items").send({
        item_name: "Beef",
        item_description: "Best beef in town!",
        item_price: 10,
        truck_id: 1,
      });
      expect(res.body.message).toMatch(/token required/i);
    });
    it("[2] requests with invalid token are rejected with right status and message", async () => {
      const res = await request(server)
        .post("/api/items")
        .set("Authorization", "qwerty")
        .send({
          item_name: "Beef",
          item_description: "Best beef in town!",
          item_price: 10,
          truck_id: 1,
        });
      expect(res.body.message).toMatch(/token invalid/i);
    });
    it("[3] creates a new item object", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "clara", password: "1234" });
      const postRes = await request(server)
        .post("/api/items")
        .set("Authorization", loginRes.body.token)
        .send({
          item_name: "Fries",
          item_description: "Best fries in town!",
          item_price: 5,
          truck_id: 4,
        });
      const itemCreated = await db("items")
        .where("item_id", postRes.body.item.item_id)
        .first();
      expect(itemCreated).toMatchObject({
        item_name: "Fries",
        item_description: "Best fries in town!",
        item_price: "5.00",
        truck_id: 4,
      });
    });
    it("[4] responds with right status and message on successful item creation", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "clara", password: "1234" });
      const postRes = await request(server)
        .post("/api/items")
        .set("Authorization", loginRes.body.token)
        .send({
          item_name: "Fries",
          item_description: "Best fries in town!",
          item_price: 5,
          truck_id: 4,
        });
      expect(postRes.body.message).toMatch(/item .* created/i);
      expect(postRes.status).toBe(201);
    });
    it("[5] responds with item created", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "clara", password: "1234" });
      const postRes = await request(server)
        .post("/api/items")
        .set("Authorization", loginRes.body.token)
        .send({
          item_name: "Fries",
          item_description: "Best fries in town!",
          item_price: 5,
          truck_id: 4,
        });
      expect(postRes.body.item).toMatchObject({
        item_name: "Fries",
        item_description: "Best fries in town!",
        item_price: 5,
        truck_id: 4,
      });
    });
    it("[6] responds with right status and message if missing item name", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "clara", password: "1234" });
      const postRes = await request(server)
        .post("/api/items")
        .set("Authorization", loginRes.body.token)
        .send({
          item_description: "Best fries in town!",
          item_price: 5,
          truck_id: 4,
        });
      expect(postRes.body.message).toMatch(/item creation failed/i);
      expect(postRes.status).toBe(422);
    });
    it("[7] responds with right status and message if POST to another user's truck_id", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "clara", password: "1234" });
      const postRes = await request(server)
        .post("/api/items")
        .set("Authorization", loginRes.body.token)
        .send({
          item_name: "Fries",
          item_description: "Best fries in town!",
          item_price: 5,
          truck_id: 1,
        });
      expect(postRes.body.message).toMatch(/invalid credentials/i);
      expect(postRes.status).toBe(401);
    });
  });

  describe("[PUT] /api/items/:item_id", () => {
    it("[1] requests without a token are rejected with right status and message", async () => {
      const res = await request(server).put("/api/items/1");
      expect(res.body.message).toMatch(/token required/i);
    });
    it("[2] requests with invalid token are rejected with right status and message", async () => {
      const res = await request(server)
        .put("/api/items/1")
        .set("Authorization", "qwerty");
      expect(res.body.message).toMatch(/token invalid/i);
    });
    it("[3] successfully edits an item object", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });

      const putRes = await request(server)
        .put("/api/items/1")
        .set("Authorization", loginRes.body.token)
        .send({
          item_name: "Brisket",
          item_description: "Best brisket in town",
          item_price: 12,
          truck_id: 1,
        });
      const itemCreated = await db("items")
        .where("item_id", putRes.body.item.item_id)
        .first();
      expect(itemCreated).toMatchObject({
        item_name: "Brisket",
        item_description: "Best brisket in town",
        item_price: "12.00",
        truck_id: 1,
      });
    });
    it("[4] responds with correct status and message on successful edit", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const putRes = await request(server)
        .put("/api/items/1")
        .set("Authorization", loginRes.body.token)
        .send({
          item_name: "Beef Tenderloin",
          item_description: "Best tenderloin in town",
          item_price: 15,
          truck_id: 1,
        });
      expect(putRes.body.message).toMatch(/item .* updated/i);
      expect(putRes.status).toBe(200);
    });
    it("[5] responds with updated item on successful edit", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const putRes = await request(server)
        .put("/api/items/1")
        .set("Authorization", loginRes.body.token)
        .send({
          item_name: "Steak",
          item_description: "Best steak in town",
          item_price: 12,
          truck_id: 1,
        });
      expect(putRes.body.item).toMatchObject({
        item_name: "Steak",
        item_description: "Best steak in town",
        item_price: 12,
        truck_id: 1,
      });
    });
    it("[6] fails to update when a user doesn't own the truck for the item", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "clara", password: "1234" });

      const putRes = await request(server)
        .put("/api/items/1")
        .set("Authorization", loginRes.body.token)
        .send({
          item_name: "Filet",
          item_description: "Best filet in town",
          item_price: 20,
          truck_id: 1,
        });

      expect(putRes.body.message).toMatch(/invalid credentials/i);
      expect(putRes.status).toBe(401);
    });
    it("[7] responds with correct status and message on attempt to edit a non-existent item", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });

      const res = await request(server)
        .put("/api/items/100")
        .set("Authorization", loginRes.body.token)
        .send({
          item_name: "Brisket",
          item_description: "Best brisket in town",
          item_price: 12,
          truck_id: 1,
        });

      expect(res.body.message).toMatch(/could not find/i);
      expect(res.status).toBe(404);
    });
  });

  describe("[DELETE] /api/items/:item_id", () => {
    it("[1] requests without a token are rejected with right status and message", async () => {
      const res = await request(server).delete("/api/items/1");
      expect(res.body.message).toMatch(/token required/i);
    });
    it("[2] requests with invalid token are rejected with right status and message", async () => {
      const res = await request(server)
        .delete("/api/items/1")
        .set("Authorization", "qwerty");
      expect(res.body.message).toMatch(/token invalid/i);
    });
    it("[3] successfully deletes an item object", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      await request(server)
        .delete("/api/items/1")
        .set("Authorization", loginRes.body.token);
      const confirmDeletion = await db("items").where("item_id", 1).first();
      expect(confirmDeletion).toBeUndefined();
    });
    it("[4] responds with correct status and message on successful deletion", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const res = await request(server)
        .delete("/api/items/1")
        .set("Authorization", loginRes.body.token);
      expect(res.body.message).toMatch(/successfully deleted/i);
      expect(res.status).toBe(200);
    });
    it("[5] responds with deleted item on successful deletion", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const res = await request(server)
        .delete("/api/items/1")
        .set("Authorization", loginRes.body.token);
      expect(res.body.item).toHaveProperty("item_id");
      expect(res.body.item).toHaveProperty("item_name");
      expect(res.body.item).toHaveProperty("item_description");
      expect(res.body.item).toHaveProperty("item_price");
      expect(res.body.item).toHaveProperty("truck_id");
    });
    it("[6] fails to delete when a user doesn't own the truck for the item", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "clara", password: "1234" });
      const res = await request(server)
        .delete("/api/items/1")
        .set("Authorization", loginRes.body.token);
      expect(res.body.message).toMatch(/invalid credentials/i);
      expect(res.status).toBe(401);
    });
    it("[7] responds with correct status and message on attempt to delete a non-existent item", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const res = await request(server)
        .delete("/api/items/100")
        .set("Authorization", loginRes.body.token);
      expect(res.body.message).toMatch(/could not find/i);
      expect(res.status).toBe(404);
    });
  });
});

describe("photos", () => {
  describe("[GET] /api/items/:item_id/photos", () => {
    it("[1] requests without a token are rejected with right status and message", async () => {
      const res = await request(server).get("/api/items/1/photos");
      expect(res.body.message).toMatch(/token required/i);
    });
    it("[2] requests with invalid token are rejected with right status and message", async () => {
      const res = await request(server)
        .get("/api/items/1/photos")
        .set("Authorization", "qwerty");
      expect(res.body.message).toMatch(/token invalid/i);
    });
    it("[3] returns a list of photo objects", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const res = await request(server)
        .get("/api/items/1/photos")
        .set("Authorization", loginRes.body.token);
      expect(res.body[0]).toHaveProperty("photo_id");
      expect(res.body[0]).toHaveProperty("photo_url");
      expect(res.body[0]).toHaveProperty("item_id");
      expect(res.body[0]).toHaveProperty("user_id");
    });
    it("[4] returns a list of trucks of length <= 5", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const res = await request(server)
        .get("/api/items/1/photos")
        .set("Authorization", loginRes.body.token);
      expect(res.body.length).toBeLessThanOrEqual(5);
    });
    it("[5] returns photo objects with urls", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const res = await request(server)
        .get("/api/items/1/photos")
        .set("Authorization", loginRes.body.token);
      expect(res.body[0].photo_url).toMatch(/https/i);
    });
    it("[5] returns photo objects with urls", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const res = await request(server)
        .get("/api/items/1/photos?limit=2")
        .set("Authorization", loginRes.body.token);
      expect(res.body.length).toBe(2);
    });
  });

  describe("[POST] /api/items/:item_id/photos", () => {
    it("[1] requests without a token are rejected with right status and message", async () => {
      const res = await request(server).post("/api/items/1/photos").send({
        photo_url: "https://images.unsplash.com/photo-1560781290-7dc94c0f8f4f",
        item_id: 1,
        user_id: 1,
      });
      expect(res.body.message).toMatch(/token required/i);
    });
    it("[2] requests with invalid token are rejected with right status and message", async () => {
      const res = await request(server)
        .post("/api/items/1/photos")
        .set("Authorization", "qwerty")
        .send({
          photo_url:
            "https://images.unsplash.com/photo-1560781290-7dc94c0f8f4f",
          item_id: 1,
          user_id: 1,
        });
      expect(res.body.message).toMatch(/token invalid/i);
    });
    it("[3] creates a new photo object", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const postRes = await request(server)
        .post("/api/items/1/photos")
        .set("Authorization", loginRes.body.token)
        .send({
          photo_url:
            "https://images.unsplash.com/photo-1560781290-7dc94c0f8f4f",
          item_id: 1,
          user_id: 1,
        });
      const photoCreated = await db("item_photos")
        .where("photo_id", postRes.body.photo.photo_id)
        .first();
      expect(photoCreated).toMatchObject({
        photo_url: "https://images.unsplash.com/photo-1560781290-7dc94c0f8f4f",
        item_id: 1,
        user_id: 1,
      });
    });
    it("[4] responds with right status and message on successful photo creation", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const postRes = await request(server)
        .post("/api/items/1/photos")
        .set("Authorization", loginRes.body.token)
        .send({
          photo_url:
            "https://images.unsplash.com/photo-1560781290-7dc94c0f8f4f",
          item_id: 1,
          user_id: 1,
        });
      expect(postRes.body.message).toMatch(/photo .* uploaded/i);
      expect(postRes.status).toBe(201);
    });
    it("[5] responds with photo created", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const postRes = await request(server)
        .post("/api/items/1/photos")
        .set("Authorization", loginRes.body.token)
        .send({
          photo_url:
            "https://images.unsplash.com/photo-1560781290-7dc94c0f8f4f",
          item_id: 1,
          user_id: 1,
        });
      expect(postRes.body.photo).toMatchObject({
        photo_url: "https://images.unsplash.com/photo-1560781290-7dc94c0f8f4f",
        item_id: 1,
        user_id: 1,
      });
    });
    it("[6] responds with right status and message if missing photo url", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const postRes = await request(server)
        .post("/api/items/1/photos")
        .set("Authorization", loginRes.body.token)
        .send({
          item_id: 1,
          user_id: 1,
        });
      expect(postRes.body.message).toMatch(/photo upload failed/i);
      expect(postRes.status).toBe(422);
    });
    it("[7] responds with right status and message if POST to another user's item_id", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "clara", password: "1234" });
      const postRes = await request(server)
        .post("/api/items/1/photos")
        .set("Authorization", loginRes.body.token)
        .send({
          photo_url:
            "https://images.unsplash.com/photo-1560781290-7dc94c0f8f4f",
          item_id: 1,
          user_id: 1,
        });
      expect(postRes.body.message).toMatch(/invalid credentials/i);
      expect(postRes.status).toBe(401);
    });
  });

  describe("[DELETE] /api/items/:item_id/photos/:photo_id", () => {
    it("[1] requests without a token are rejected with right status and message", async () => {
      const res = await request(server).delete("/api/items/1/photos/1");
      expect(res.body.message).toMatch(/token required/i);
    });
    it("[2] requests with invalid token are rejected with right status and message", async () => {
      const res = await request(server)
        .delete("/api/items/1/photos/1")
        .set("Authorization", "qwerty");
      expect(res.body.message).toMatch(/token invalid/i);
    });
    it("[3] successfully deletes a photo object", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      await request(server)
        .delete("/api/items/1/photos/1")
        .set("Authorization", loginRes.body.token);
      const confirmDeletion = await db("item_photos")
        .where("photo_id", 1)
        .first();
      expect(confirmDeletion).toBeUndefined();
    });
    it("[4] responds with correct status and message on successful deletion", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const res = await request(server)
        .delete("/api/items/1/photos/1")
        .set("Authorization", loginRes.body.token);
      expect(res.body.message).toMatch(/successfully deleted/i);
      expect(res.status).toBe(200);
    });
    it("[5] responds with deleted photo on successful deletion", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const res = await request(server)
        .delete("/api/items/1/photos/1")
        .set("Authorization", loginRes.body.token);
      expect(res.body.photo).toHaveProperty("photo_id");
      expect(res.body.photo).toHaveProperty("photo_url");
      expect(res.body.photo).toHaveProperty("item_id");
      expect(res.body.photo).toHaveProperty("user_id");
    });
    it("[6] fails to delete when a user doesn't own the photo", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "clara", password: "1234" });
      const res = await request(server)
        .delete("/api/items/1/photos/1")
        .set("Authorization", loginRes.body.token);
      expect(res.body.message).toMatch(/invalid credentials/i);
      expect(res.status).toBe(401);
    });
    it("[7] responds with correct status and message on attempt to delete a non-existent photo", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const res = await request(server)
        .delete("/api/items/1/photos/100")
        .set("Authorization", loginRes.body.token);
      expect(res.body.message).toMatch(/could not find/i);
      expect(res.status).toBe(404);
    });
  });
});

describe("item ratings", () => {
  describe("[POST] /api/items/:item_id/item-ratings", () => {
    it("[1] requests without a token are rejected with right status and message", async () => {
      const res = await request(server).post("/api/items/5/item-ratings").send({
        user_id: 1,
        item_id: 5,
        item_rating: 4,
      });
      expect(res.body.message).toMatch(/token required/i);
    });
    it("[2] requests with invalid token are rejected with right status and message", async () => {
      const res = await request(server)
        .post("/api/items/5/item-ratings")
        .set("Authorization", "qwerty")
        .send({
          user_id: 1,
          item_id: 5,
          item_rating: 4,
        });
      expect(res.body.message).toMatch(/token invalid/i);
    });
    it("[3] creates a new item rating object", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const postRes = await request(server)
        .post("/api/items/5/item-ratings")
        .set("Authorization", loginRes.body.token)
        .send({
          user_id: 1,
          item_id: 5,
          item_rating: 4,
        });
      const itemRatingCreated = await db("item_ratings")
        .where("item_rating_id", postRes.body.rating.item_rating_id)
        .first();
      expect(itemRatingCreated).toMatchObject({
        user_id: 1,
        item_id: 5,
        item_rating: 4,
      });
    });
    it("[4] responds with right status and message on successful item rating creation", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const postRes = await request(server)
        .post("/api/items/5/item-ratings")
        .set("Authorization", loginRes.body.token)
        .send({
          user_id: 1,
          item_id: 5,
          item_rating: 4,
        });
      expect(postRes.body.message).toMatch(/item rating .* created/i);
      expect(postRes.status).toBe(201);
    });
    it("[5] responds with item rating created", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const postRes = await request(server)
        .post("/api/items/5/item-ratings")
        .set("Authorization", loginRes.body.token)
        .send({
          user_id: 1,
          item_id: 5,
          item_rating: 4,
        });
      expect(postRes.body.rating).toMatchObject({
        user_id: 1,
        item_id: 5,
        item_rating: 4,
      });
    });
    it("[6] responds with right status and message if missing item id", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const postRes = await request(server)
        .post("/api/items/5/item-ratings")
        .set("Authorization", loginRes.body.token)
        .send({
          user_id: 1,
          item_rating: 4,
        });
      expect(postRes.body.message).toMatch(/item rating creation failed/i);
      expect(postRes.status).toBe(422);
    });
    it("[7] responds with right status and message if POST to another user_id", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const postRes = await request(server)
        .post("/api/items/5/item-ratings")
        .set("Authorization", loginRes.body.token)
        .send({
          user_id: 2,
          item_id: 5,
          item_rating: 4,
        });
      expect(postRes.body.message).toMatch(/invalid credentials/i);
      expect(postRes.status).toBe(401);
    });
    it("[8] item_id in body matches item_id in params", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const postRes = await request(server)
        .post("/api/items/1/item-ratings")
        .set("Authorization", loginRes.body.token)
        .send({
          user_id: 1,
          item_id: 5,
          item_rating: 4,
        });
      expect(postRes.body.message).toMatch(
        /item rating body must match params in path/i
      );
      expect(postRes.status).toBe(422);
    });
    it("[9] cannot POST if item rating already exists for that user_id and item_id", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      await request(server)
        .post("/api/items/5/item-ratings")
        .set("Authorization", loginRes.body.token)
        .send({
          user_id: 1,
          item_id: 5,
          item_rating: 4,
        });
      const postRes = await request(server)
        .post("/api/items/5/item-ratings")
        .set("Authorization", loginRes.body.token)
        .send({
          user_id: 1,
          item_id: 5,
          item_rating: 3,
        });
      expect(postRes.body.message).toMatch(/item rating already exists/i);
      expect(postRes.status).toBe(422);
    });
  });

  // describe("[PUT] /api/trucks/:truck_id/truck-ratings/:truck_rating_id", () => {
  //   it("[1] requests without a token are rejected with right status and message", async () => {
  //     const res = await request(server).put("/api/trucks/1/truck-ratings/1");
  //     expect(res.body.message).toMatch(/token required/i);
  //   });
  //   it("[2] requests with invalid token are rejected with right status and message", async () => {
  //     const res = await request(server)
  //       .put("/api/trucks/1/truck-ratings/1")
  //       .set("Authorization", "qwerty");
  //     expect(res.body.message).toMatch(/token invalid/i);
  //   });
  //   it("[3] successfully edits a truck rating object", async () => {
  //     const loginRes = await request(server)
  //       .post("/api/auth/login")
  //       .send({ username: "jeff", password: "1234" });
  //     const putRes = await request(server)
  //       .put("/api/trucks/1/truck-ratings/1")
  //       .set("Authorization", loginRes.body.token)
  //       .send({
  //         truck_id: 1,
  //         user_id: 1,
  //         truck_rating: 2,
  //       });
  //     const truckRatingUpdated = await db("truck_ratings")
  //       .where("truck_rating_id", putRes.body.rating.truck_rating_id)
  //       .first();
  //     expect(truckRatingUpdated).toMatchObject({
  //       truck_id: 1,
  //       user_id: 1,
  //       truck_rating: 2,
  //     });
  //   });
  //   it("[4] responds with correct status and message on successful edit", async () => {
  //     const loginRes = await request(server)
  //       .post("/api/auth/login")
  //       .send({ username: "jeff", password: "1234" });
  //     const putRes = await request(server)
  //       .put("/api/trucks/1/truck-ratings/1")
  //       .set("Authorization", loginRes.body.token)
  //       .send({
  //         truck_id: 1,
  //         user_id: 1,
  //         truck_rating: 2,
  //       });
  //     expect(putRes.body.message).toMatch(/truck rating .* updated/i);
  //     expect(putRes.status).toBe(200);
  //   });
  //   it("[5] responds with updated truck rating on successful edit", async () => {
  //     const loginRes = await request(server)
  //       .post("/api/auth/login")
  //       .send({ username: "jeff", password: "1234" });
  //     const putRes = await request(server)
  //       .put("/api/trucks/1/truck-ratings/1")
  //       .set("Authorization", loginRes.body.token)
  //       .send({
  //         truck_id: 1,
  //         user_id: 1,
  //         truck_rating: 2,
  //       });
  //     expect(putRes.body.rating).toMatchObject({
  //       truck_id: 1,
  //       user_id: 1,
  //       truck_rating: 2,
  //     });
  //   });
  //   it("[6] fails to update when a user doesn't own the truck rating", async () => {
  //     const loginRes = await request(server)
  //       .post("/api/auth/login")
  //       .send({ username: "clara", password: "1234" });
  //     const putRes = await request(server)
  //       .put("/api/trucks/1/truck-ratings/1")
  //       .set("Authorization", loginRes.body.token)
  //       .send({
  //         truck_id: 1,
  //         user_id: 1,
  //         truck_rating: 2,
  //       });
  //     expect(putRes.body.message).toMatch(/invalid credentials/i);
  //     expect(putRes.status).toBe(401);
  //   });
  //   it("[7] responds with correct status and message on attempt to edit a non-existent truck rating", async () => {
  //     const loginRes = await request(server)
  //       .post("/api/auth/login")
  //       .send({ username: "jeff", password: "1234" });
  //     const res = await request(server)
  //       .put("/api/trucks/1/truck-ratings/100")
  //       .set("Authorization", loginRes.body.token)
  //       .send({
  //         truck_id: 1,
  //         user_id: 1,
  //         truck_rating: 2,
  //       });
  //     expect(res.body.message).toMatch(/could not find/i);
  //     expect(res.status).toBe(404);
  //   });
  //   it("[8] cannot edit a truck rating to a different user_id", async () => {
  //     const loginRes = await request(server)
  //       .post("/api/auth/login")
  //       .send({ username: "jeff", password: "1234" });
  //     const res = await request(server)
  //       .put("/api/trucks/1/truck-ratings/1")
  //       .set("Authorization", loginRes.body.token)
  //       .send({
  //         truck_id: 1,
  //         user_id: 2,
  //         truck_rating: 2,
  //       });
  //     expect(res.body.message).toMatch(/invalid credentials/i);
  //     expect(res.status).toBe(401);
  //   });
  // });
});
