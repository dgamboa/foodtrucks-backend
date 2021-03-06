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

describe("trucks", () => {
  describe("[POST] /api/trucks", () => {
    it("[1] requests without a token are rejected with right status and message", async () => {
      const res = await request(server).post("/api/trucks").send({
        truck_name: "Salty",
        truck_description: "Best BBQ in town!",
        open_time: "09:00:00",
        close_time: "20:00:00",
        cuisine: "BBQ",
      });
      expect(res.body.message).toMatch(/token required/i);
    });
    it("[2] requests with invalid token are rejected with right status and message", async () => {
      const res = await request(server)
        .post("/api/trucks")
        .set("Authorization", "qwerty")
        .send({
          truck_name: "Salty",
          truck_description: "Best BBQ in town!",
          open_time: "09:00:00",
          close_time: "20:00:00",
          cuisine: "BBQ",
        });
      expect(res.body.message).toMatch(/token invalid/i);
    });
    it("[3] creates a new truck object", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const postRes = await request(server)
        .post("/api/trucks")
        .set("Authorization", loginRes.body.token)
        .send({
          truck_name: "Salty",
          truck_description: "Best BBQ in town!",
          open_time: "09:00:00",
          close_time: "20:00:00",
          cuisine: "BBQ",
          user_id: 1,
        });
      const truckCreated = await db("trucks")
        .where("truck_id", postRes.body.truck.truck_id)
        .first();
      expect(truckCreated).toMatchObject({
        truck_name: "Salty",
        truck_description: "Best BBQ in town!",
        cuisine: "BBQ",
      });
    });
    it("[4] responds with right status and message on successful truck creation", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const postRes = await request(server)
        .post("/api/trucks")
        .set("Authorization", loginRes.body.token)
        .send({
          truck_name: "Salty",
          truck_description: "Best BBQ in town!",
          open_time: "09:00:00",
          close_time: "20:00:00",
          cuisine: "BBQ",
          user_id: 1,
        });
      expect(postRes.body.message).toMatch(/truck .* created/i);
      expect(postRes.status).toBe(201);
    });
    it("[5] responds with truck created", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const postRes = await request(server)
        .post("/api/trucks")
        .set("Authorization", loginRes.body.token)
        .send({
          truck_name: "Salty",
          truck_description: "Best BBQ in town!",
          open_time: "09:00:00",
          close_time: "20:00:00",
          cuisine: "BBQ",
          user_id: 1,
        });
      expect(postRes.body.truck).toMatchObject({
        truck_name: "Salty",
        truck_description: "Best BBQ in town!",
        cuisine: "BBQ",
      });
    });
    it("[6] responds with right status and message if missing truck name", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const postRes = await request(server)
        .post("/api/trucks")
        .set("Authorization", loginRes.body.token)
        .send({
          truck_description: "Best BBQ in town!",
          open_time: "09:00:00",
          close_time: "20:00:00",
          cuisine: "BBQ",
          user_id: 1,
        });
      expect(postRes.body.message).toMatch(/truck creation failed/i);
      expect(postRes.status).toBe(422);
    });
    it("[7] responds with right status and message if POST to another user_id", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const postRes = await request(server)
        .post("/api/trucks")
        .set("Authorization", loginRes.body.token)
        .send({
          truck_name: "Salty",
          truck_description: "Best BBQ in town!",
          open_time: "09:00:00",
          close_time: "20:00:00",
          cuisine: "BBQ",
          user_id: 2,
        });
      expect(postRes.body.message).toMatch(/invalid credentials/i);
      expect(postRes.status).toBe(401);
    });
  });

  describe("[GET] /api/trucks", () => {
    it("[1] requests without a token are rejected with right status and message", async () => {
      const res = await request(server).get("/api/trucks");
      expect(res.body.message).toMatch(/token required/i);
    });
    it("[2] requests with invalid token are rejected with right status and message", async () => {
      const res = await request(server)
        .get("/api/trucks")
        .set("Authorization", "qwerty");
      expect(res.body.message).toMatch(/token invalid/i);
    });
    it("[3] returns a list of truck objects", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const res = await request(server)
        .get("/api/trucks")
        .set("Authorization", loginRes.body.token);
      expect(res.body[0]).toHaveProperty("truck_id");
      expect(res.body[0]).toHaveProperty("truck_name");
      expect(res.body[0]).toHaveProperty("number_of_ratings");
      expect(res.body[0]).toHaveProperty("truck_avg_rating");
    });
    it("[4] returns a list of trucks of length <= 20", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });

      for (let i = 0; i <= 20; i++) {
        await db("trucks").insert({
          truck_name: "Salty",
          truck_description: "Best BBQ in town!",
          open_time: "09:00:00",
          close_time: "20:00:00",
          cuisine: "BBQ",
          user_id: 1,
        });
      }

      const res = await request(server)
        .get("/api/trucks")
        .set("Authorization", loginRes.body.token);
      expect(res.body.length).toBeLessThanOrEqual(20);
    });
    it("[5] returns trucks with rating information of right type", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const res = await request(server)
        .get("/api/trucks")
        .set("Authorization", loginRes.body.token);
      expect(res.body[0].number_of_ratings).toBe(0);
      expect(res.body[0].truck_avg_rating).toBe(null);
    });
    it("[6] returns the number of trucks requested through query", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const res = await request(server)
        .get("/api/trucks?limit=2")
        .set("Authorization", loginRes.body.token);
      expect(res.body.length).toBe(2);
    });
    it("[7] returns trucks that match search query for truck name", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const res = await request(server)
        .get("/api/trucks?name=brisk+it")
        .set("Authorization", loginRes.body.token);
      expect(res.body.length).toBe(1);
      expect(res.body[0].truck_name).toBe("Brisk It");
    });
  });

  describe("[GET] /api/trucks/:truck_id", () => {
    it("[1] requests without a token are rejected with right status and message", async () => {
      const res = await request(server).get("/api/trucks/1");
      expect(res.body.message).toMatch(/token required/i);
    });
    it("[2] requests with invalid token are rejected with right status and message", async () => {
      const res = await request(server)
        .get("/api/trucks/1")
        .set("Authorization", "qwerty");
      expect(res.body.message).toMatch(/token invalid/i);
    });
    it("[3] returns a truck object", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const res = await request(server)
        .get("/api/trucks/1")
        .set("Authorization", loginRes.body.token);
      expect(res.body).toHaveProperty("truck_id");
      expect(res.body).toHaveProperty("truck_name");
      expect(res.body).toHaveProperty("truck_description");
      expect(res.body).toHaveProperty("image_url");
      expect(res.body).toHaveProperty("truck_lat");
      expect(res.body).toHaveProperty("truck_long");
      expect(res.body).toHaveProperty("open_time");
      expect(res.body).toHaveProperty("close_time");
      expect(res.body).toHaveProperty("cuisine");
      expect(res.body).toHaveProperty("number_of_ratings");
      expect(res.body).toHaveProperty("truck_avg_rating");
      expect(res.body).toHaveProperty("items");
    });
    it("[4] truck object includes items array", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const res = await request(server)
        .get("/api/trucks/1")
        .set("Authorization", loginRes.body.token);
      expect(res.body.items).toHaveLength(2);
    });
    it("[5] truck object has rating information of right type", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const res = await request(server)
        .get("/api/trucks/1")
        .set("Authorization", loginRes.body.token);
      expect(res.body.number_of_ratings).toBe(3);
      expect(res.body.truck_avg_rating).toBe(4.33);
    });
  });

  describe("[PUT] /api/trucks/:truck_id", () => {
    it("[1] requests without a token are rejected with right status and message", async () => {
      const res = await request(server).put("/api/trucks/1");
      expect(res.body.message).toMatch(/token required/i);
    });
    it("[2] requests with invalid token are rejected with right status and message", async () => {
      const res = await request(server)
        .put("/api/trucks/1")
        .set("Authorization", "qwerty");
      expect(res.body.message).toMatch(/token invalid/i);
    });
    it("[3] successfully edits a truck object", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });

      const putRes = await request(server)
        .put("/api/trucks/1")
        .set("Authorization", loginRes.body.token)
        .send({
          truck_name: "Brisk It",
          truck_description: "Better BBQ!",
          open_time: "09:00:00",
          close_time: "21:00:00",
          cuisine: "BBQ",
          user_id: 1,
        });
      const truckCreated = await db("trucks")
        .where("truck_id", putRes.body.truck.truck_id)
        .first();
      expect(truckCreated).toMatchObject({
        truck_name: "Brisk It",
        truck_description: "Better BBQ!",
        cuisine: "BBQ",
      });
    });
    it("[4] responds with correct status and message on successful edit", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const putRes = await request(server)
        .put("/api/trucks/1")
        .set("Authorization", loginRes.body.token)
        .send({
          truck_name: "Brisk It",
          truck_description: "Better BBQ!",
          open_time: "09:00:00",
          close_time: "21:00:00",
          cuisine: "BBQ",
          user_id: 1,
        });
      expect(putRes.body.message).toMatch(/truck .* updated/i);
      expect(putRes.status).toBe(200);
    });
    it("[5] responds with updated truck on successful edit", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const putRes = await request(server)
        .put("/api/trucks/1")
        .set("Authorization", loginRes.body.token)
        .send({
          truck_name: "Brisk It",
          truck_description: "Better BBQ!",
          open_time: "09:00:00",
          close_time: "21:00:00",
          cuisine: "BBQ",
          user_id: 1,
        });
      expect(putRes.body.truck).toMatchObject({
        truck_name: "Brisk It",
        truck_description: "Better BBQ!",
        cuisine: "BBQ",
      });
    });
    it("[6] fails to update when a user doesn't own the truck", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "clara", password: "1234" });

      const putRes = await request(server)
        .put("/api/trucks/1")
        .set("Authorization", loginRes.body.token)
        .send({
          truck_name: "Brisk It",
          truck_description: "Better BBQ!",
          open_time: "09:00:00",
          close_time: "21:00:00",
          cuisine: "BBQ",
          user_id: 1,
        });

      expect(putRes.body.message).toMatch(/invalid credentials/i);
      expect(putRes.status).toBe(401);
    });
    it("[7] responds with correct status and message on attempt to edit a non-existent truck", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });

      const res = await request(server)
        .put("/api/trucks/100")
        .set("Authorization", loginRes.body.token)
        .send({
          truck_name: "Brisk It",
          truck_description: "Better BBQ!",
          open_time: "09:00:00",
          close_time: "21:00:00",
          cuisine: "BBQ",
          user_id: 1,
        });

      expect(res.body.message).toMatch(/could not find/i);
      expect(res.status).toBe(404);
    });
  });

  describe("[DELETE] /api/trucks/:truck_id", () => {
    it("[1] requests without a token are rejected with right status and message", async () => {
      const res = await request(server).delete("/api/trucks/1");
      expect(res.body.message).toMatch(/token required/i);
    });
    it("[2] requests with invalid token are rejected with right status and message", async () => {
      const res = await request(server)
        .delete("/api/trucks/1")
        .set("Authorization", "qwerty");
      expect(res.body.message).toMatch(/token invalid/i);
    });
    it("[3] successfully deletes a truck object", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });

      await request(server)
        .delete("/api/trucks/1")
        .set("Authorization", loginRes.body.token);

      const confirmDeletion = await db("trucks").where("truck_id", 1).first();
      expect(confirmDeletion).toBeUndefined();
    });
    it("[4] responds with correct status and message on successful deletion", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });

      const res = await request(server)
        .delete("/api/trucks/2")
        .set("Authorization", loginRes.body.token);

      expect(res.body.message).toMatch(/successfully deleted/i);
      expect(res.status).toBe(200);
    });
    it("[5] responds with delete truck on successful deletion", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });

      const res = await request(server)
        .delete("/api/trucks/1")
        .set("Authorization", loginRes.body.token);

      expect(res.body.truck).toHaveProperty("truck_id");
      expect(res.body.truck).toHaveProperty("truck_name");
    });
    it("[6] fails to delete when a user doesn't own the truck", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "clara", password: "1234" });

      const res = await request(server)
        .delete("/api/trucks/1")
        .set("Authorization", loginRes.body.token);

      expect(res.body.message).toMatch(/invalid credentials/i);
      expect(res.status).toBe(401);
    });
    it("[7] responds with correct status and message on attempt to delete a non-existent truck", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });

      const res = await request(server)
        .delete("/api/trucks/100")
        .set("Authorization", loginRes.body.token);

      expect(res.body.message).toMatch(/could not find/i);
      expect(res.status).toBe(404);
    });
  });
});

describe("truck ratings", () => {
  describe("[POST] /api/trucks/:truck_id/truck-ratings", () => {
    it("[1] requests without a token are rejected with right status and message", async () => {
      const res = await request(server)
        .post("/api/trucks/3/truck-ratings")
        .send({
          truck_id: 3,
          user_id: 1,
          truck_rating: 4,
        });
      expect(res.body.message).toMatch(/token required/i);
    });
    it("[2] requests with invalid token are rejected with right status and message", async () => {
      const res = await request(server)
        .post("/api/trucks/3/truck-ratings")
        .set("Authorization", "qwerty")
        .send({
          truck_id: 3,
          user_id: 1,
          truck_rating: 4,
        });
      expect(res.body.message).toMatch(/token invalid/i);
    });
    it("[3] creates a new truck rating object", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const postRes = await request(server)
        .post("/api/trucks/3/truck-ratings")
        .set("Authorization", loginRes.body.token)
        .send({
          truck_id: 3,
          user_id: 1,
          truck_rating: 4,
        });
      const truckRatingCreated = await db("truck_ratings")
        .where("truck_rating_id", postRes.body.rating.truck_rating_id)
        .first();
      expect(truckRatingCreated).toMatchObject({
        truck_id: 3,
        user_id: 1,
        truck_rating: 4,
      });
    });
    it("[4] responds with right status and message on successful truck rating creation", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const postRes = await request(server)
        .post("/api/trucks/3/truck-ratings")
        .set("Authorization", loginRes.body.token)
        .send({
          truck_id: 3,
          user_id: 1,
          truck_rating: 4,
        });
      expect(postRes.body.message).toMatch(/truck rating .* created/i);
      expect(postRes.status).toBe(201);
    });
    it("[5] responds with truck rating created", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const postRes = await request(server)
        .post("/api/trucks/3/truck-ratings")
        .set("Authorization", loginRes.body.token)
        .send({
          truck_id: 3,
          user_id: 1,
          truck_rating: 4,
        });
      expect(postRes.body.rating).toMatchObject({
        truck_id: 3,
        user_id: 1,
        truck_rating: 4,
      });
    });
    it("[6] responds with right status and message if missing truck id", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const postRes = await request(server)
        .post("/api/trucks/3/truck-ratings")
        .set("Authorization", loginRes.body.token)
        .send({
          user_id: 1,
          truck_rating: 4,
        });
      expect(postRes.body.message).toMatch(/truck rating creation failed/i);
      expect(postRes.status).toBe(422);
    });
    it("[7] responds with right status and message if POST to another user_id", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const postRes = await request(server)
        .post("/api/trucks/3/truck-ratings")
        .set("Authorization", loginRes.body.token)
        .send({
          truck_id: 3,
          user_id: 3,
          truck_rating: 4,
        });
      expect(postRes.body.message).toMatch(/invalid credentials/i);
      expect(postRes.status).toBe(401);
    });
    it("[8] truck_id in body matches truck_id in params", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const postRes = await request(server)
        .post("/api/trucks/3/truck-ratings")
        .set("Authorization", loginRes.body.token)
        .send({
          truck_id: 2,
          user_id: 1,
          truck_rating: 4,
        });
      expect(postRes.body.message).toMatch(
        /truck id in body must match params in path/i
      );
      expect(postRes.status).toBe(422);
    });
    it("[9] cannot POST if truck rating already exists for that user_id and truck_id", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      await request(server)
        .post("/api/trucks/3/truck-ratings")
        .set("Authorization", loginRes.body.token)
        .send({
          truck_id: 3,
          user_id: 1,
          truck_rating: 4,
        });
      const postRes = await request(server)
        .post("/api/trucks/1/truck-ratings")
        .set("Authorization", loginRes.body.token)
        .send({
          truck_id: 1,
          user_id: 1,
          truck_rating: 4,
        });
      expect(postRes.body.message).toMatch(/truck rating already exists/i);
      expect(postRes.status).toBe(422);
    });
  });

  describe("[PUT] /api/trucks/:truck_id/truck-ratings/:truck_rating_id", () => {
    it("[1] requests without a token are rejected with right status and message", async () => {
      const res = await request(server).put("/api/trucks/1/truck-ratings/1");
      expect(res.body.message).toMatch(/token required/i);
    });
    it("[2] requests with invalid token are rejected with right status and message", async () => {
      const res = await request(server)
        .put("/api/trucks/1/truck-ratings/1")
        .set("Authorization", "qwerty");
      expect(res.body.message).toMatch(/token invalid/i);
    });
    it("[3] successfully edits a truck rating object", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const putRes = await request(server)
        .put("/api/trucks/1/truck-ratings/1")
        .set("Authorization", loginRes.body.token)
        .send({
          truck_id: 1,
          user_id: 1,
          truck_rating: 2,
        });
      const truckRatingUpdated = await db("truck_ratings")
        .where("truck_rating_id", putRes.body.rating.truck_rating_id)
        .first();
      expect(truckRatingUpdated).toMatchObject({
        truck_id: 1,
        user_id: 1,
        truck_rating: 2,
      });
    });
    it("[4] responds with correct status and message on successful edit", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const putRes = await request(server)
        .put("/api/trucks/1/truck-ratings/1")
        .set("Authorization", loginRes.body.token)
        .send({
          truck_id: 1,
          user_id: 1,
          truck_rating: 2,
        });
      expect(putRes.body.message).toMatch(/truck rating .* updated/i);
      expect(putRes.status).toBe(200);
    });
    it("[5] responds with updated truck rating on successful edit", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const putRes = await request(server)
        .put("/api/trucks/1/truck-ratings/1")
        .set("Authorization", loginRes.body.token)
        .send({
          truck_id: 1,
          user_id: 1,
          truck_rating: 2,
        });
      expect(putRes.body.rating).toMatchObject({
        truck_id: 1,
        user_id: 1,
        truck_rating: 2,
      });
    });
    it("[6] fails to update when a user doesn't own the truck rating", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "clara", password: "1234" });
      const putRes = await request(server)
        .put("/api/trucks/1/truck-ratings/1")
        .set("Authorization", loginRes.body.token)
        .send({
          truck_id: 1,
          user_id: 1,
          truck_rating: 2,
        });
      expect(putRes.body.message).toMatch(/invalid credentials/i);
      expect(putRes.status).toBe(401);
    });
    it("[7] responds with correct status and message on attempt to edit a non-existent truck rating", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const res = await request(server)
        .put("/api/trucks/1/truck-ratings/100")
        .set("Authorization", loginRes.body.token)
        .send({
          truck_id: 1,
          user_id: 1,
          truck_rating: 2,
        });
      expect(res.body.message).toMatch(/could not find/i);
      expect(res.status).toBe(404);
    });
    it("[8] cannot edit a truck rating to a different user_id", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const res = await request(server)
        .put("/api/trucks/1/truck-ratings/1")
        .set("Authorization", loginRes.body.token)
        .send({
          truck_id: 1,
          user_id: 2,
          truck_rating: 2,
        });
      expect(res.body.message).toMatch(/invalid credentials/i);
      expect(res.status).toBe(401);
    });
    it("[9] truck_id in body matches truck_id in params", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const postRes = await request(server)
        .put("/api/trucks/1/truck-ratings/1")
        .set("Authorization", loginRes.body.token)
        .send({
          truck_id: 2,
          user_id: 1,
          truck_rating: 1,
        });
      expect(postRes.body.message).toMatch(
        /truck id in body must match params in path/i
      );
      expect(postRes.status).toBe(422);
    });
  });
});

describe("truck favorite", () => {
  describe("[POST] /api/trucks/:truck_id/favorites", () => {
    it("[1] requests without a token are rejected with right status and message", async () => {
      const res = await request(server).post("/api/trucks/4/favorites").send({
        truck_id: 4,
        user_id: 1,
      });
      expect(res.body.message).toMatch(/token required/i);
    });
    it("[2] requests with invalid token are rejected with right status and message", async () => {
      const res = await request(server)
        .post("/api/trucks/4/favorites")
        .set("Authorization", "qwerty")
        .send({
          truck_id: 4,
          user_id: 1,
        });
      expect(res.body.message).toMatch(/token invalid/i);
    });
    it("[3] creates a new truck favorite record", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const postRes = await request(server)
        .post("/api/trucks/4/favorites")
        .set("Authorization", loginRes.body.token)
        .send({
          truck_id: 4,
          user_id: 1,
        });
      const truckFavCreated = await db("favorites")
        .where("favorite_id", postRes.body.favorite.favorite_id)
        .first();
      expect(truckFavCreated).toMatchObject({
        truck_id: 4,
        user_id: 1,
      });
    });
    it("[4] responds with right status and message on successful favorite of a truck", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const postRes = await request(server)
        .post("/api/trucks/4/favorites")
        .set("Authorization", loginRes.body.token)
        .send({
          truck_id: 4,
          user_id: 1,
        });
      expect(postRes.body.message).toMatch(/truck .* added to favorites/i);
      expect(postRes.status).toBe(201);
    });
    it("[5] responds with truck favorite record", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const postRes = await request(server)
        .post("/api/trucks/4/favorites")
        .set("Authorization", loginRes.body.token)
        .send({
          truck_id: 4,
          user_id: 1,
        });
      expect(postRes.body.favorite).toMatchObject({
        truck_id: 4,
        user_id: 1,
      });
    });
    it("[6] responds with right status and message if missing truck id", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const postRes = await request(server)
        .post("/api/trucks/4/favorites")
        .set("Authorization", loginRes.body.token)
        .send({
          user_id: 1,
        });
      expect(postRes.body.message).toMatch(
        /truck not added to favorites due to missing property/i
      );
      expect(postRes.status).toBe(422);
    });
    it("[7] responds with right status and message if POST to another user_id", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const postRes = await request(server)
        .post("/api/trucks/4/favorites")
        .set("Authorization", loginRes.body.token)
        .send({
          truck_id: 4,
          user_id: 2,
        });
      expect(postRes.body.message).toMatch(/invalid credentials/i);
      expect(postRes.status).toBe(401);
    });
    it("[8] truck_id in body matches truck_id in params", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const postRes = await request(server)
        .post("/api/trucks/4/favorites")
        .set("Authorization", loginRes.body.token)
        .send({
          truck_id: 3,
          user_id: 1,
        });
      expect(postRes.body.message).toMatch(
        /truck id in body must match params in path/i
      );
      expect(postRes.status).toBe(422);
    });
    it("[9] cannot POST if truck favorite record already exists for that user_id and truck_id", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      await request(server)
        .post("/api/trucks/4/favorites")
        .set("Authorization", loginRes.body.token)
        .send({
          truck_id: 4,
          user_id: 1,
        });
      const postRes = await request(server)
        .post("/api/trucks/4/favorites")
        .set("Authorization", loginRes.body.token)
        .send({
          truck_id: 4,
          user_id: 1,
        });
      expect(postRes.body.message).toMatch(/truck favorite already exists/i);
      expect(postRes.status).toBe(422);
    });
  });

  describe("[DELETE] /api/trucks/:truck_id/favorites/:favorite_id", () => {
    it("[1] requests without a token are rejected with right status and message", async () => {
      const res = await request(server).delete("/api/trucks/1/favorites/1");
      expect(res.body.message).toMatch(/token required/i);
    });
    it("[2] requests with invalid token are rejected with right status and message", async () => {
      const res = await request(server)
        .delete("/api/trucks/1/favorites/1")
        .set("Authorization", "qwerty");
      expect(res.body.message).toMatch(/token invalid/i);
    });
    it("[3] successfully deletes a favorite record", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      await request(server)
        .delete("/api/trucks/1/favorites/1")
        .set("Authorization", loginRes.body.token);
      const confirmDeletion = await db("favorites")
        .where("favorite_id", 1)
        .first();
      expect(confirmDeletion).toBeUndefined();
    });
    it("[4] responds with correct status and message on successful deletion", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "clara", password: "1234" });
      const res = await request(server)
        .delete("/api/trucks/1/favorites/5")
        .set("Authorization", loginRes.body.token);
      expect(res.body.message).toMatch(/successfully deleted/i);
      expect(res.status).toBe(200);
    });
    it("[5] responds with deleted favorite record on successful deletion", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const res = await request(server)
        .delete("/api/trucks/1/favorites/1")
        .set("Authorization", loginRes.body.token);
      expect(res.body.favorite).toHaveProperty("favorite_id");
      expect(res.body.favorite).toHaveProperty("truck_id");
      expect(res.body.favorite).toHaveProperty("user_id");
    });
    it("[6] fails to delete when a user doesn't own the favorite", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "clara", password: "1234" });
      const res = await request(server)
        .delete("/api/trucks/1/favorites/1")
        .set("Authorization", loginRes.body.token);
      expect(res.body.message).toMatch(/invalid credentials/i);
      expect(res.status).toBe(401);
    });
    it("[7] responds with correct status and message on attempt to delete a non-existent favorite", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const res = await request(server)
        .delete("/api/trucks/1/favorites/100")
        .set("Authorization", loginRes.body.token);
      expect(res.body.message).toMatch(/could not find favorite/i);
      expect(res.status).toBe(404);
    });
    it("[8] responds with correct status and message on attempt to delete favorite from a non-existent truck", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "jeff", password: "1234" });
      const res = await request(server)
        .delete("/api/trucks/100/favorites/1")
        .set("Authorization", loginRes.body.token);
      expect(res.body.message).toMatch(/could not find truck/i);
      expect(res.status).toBe(404);
    });
  });
});
