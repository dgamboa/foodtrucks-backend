const request = require("supertest");
const server = require("./server");
const db = require("./data/db-config");

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
  await request(server)
    .post("/api/auth/register")
    .send({ username: "roger", email: "roger@test.com", password: "1234" });
});

afterAll(async () => {
  await db.destroy();
});

test("sanity", () => {
  expect(true).toBe(true);
});

describe("server.js", () => {
  describe("[GET] /api/users/:user_id", () => {
    it("[1] requests without a token are rejected with right status and message", async () => {
      const res = await request(server).get("/api/users/1");
      expect(res.body.message).toMatch(/token required/i);
    });
    it("[2] requests with invalid token are rejected with right status and message", async () => {
      const res = await request(server)
        .get("/api/users/1")
        .set("Authorization", "qwerty");
      expect(res.body.message).toMatch(/token invalid/i);
    });
    it("[3] requests with valid token return a user", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "roger", password: "1234" });
      const usersRes = await request(server)
        .get("/api/users/1")
        .set("Authorization", loginRes.body.token);
      expect(usersRes.body).toHaveProperty("user_id");
      expect(usersRes.body).toHaveProperty("username");
      expect(usersRes.body).toHaveProperty("email");
      expect(usersRes.body).toHaveProperty("user_lat");
      expect(usersRes.body).toHaveProperty("user_long");
      expect(usersRes.body).toHaveProperty("favorite_trucks");
      expect(usersRes.body).toHaveProperty("trucks_owned");
    });
    it("[4] requests with valid token return the right user", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "roger", password: "1234" });
      const usersRes = await request(server)
        .get("/api/users/1")
        .set("Authorization", loginRes.body.token);
      expect(usersRes.body).toMatchObject({ user_id: 1, username: "roger" });
    });
    it("[5] requests with valid token can't access other users", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "roger", password: "1234" });
      const usersRes = await request(server)
        .get("/api/users/2")
        .set("Authorization", loginRes.body.token);
      expect(usersRes.body.message).toMatch(/invalid credentials/i);
      expect(usersRes.status).toBe(401);
    });
  });

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
        .send({ username: "roger", password: "1234" });
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
        .send({ username: "roger", password: "1234" });
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
        .send({ username: "roger", password: "1234" });
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
        .send({ username: "roger", password: "1234" });
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
      expect(postRes.body.message).toMatch(/trucks require/i);
      expect(postRes.status).toBe(422);
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
        .send({ username: "roger", password: "1234" });
      const res = await request(server)
        .get("/api/trucks")
        .set("Authorization", loginRes.body.token);
      expect(res.body[0]).toHaveProperty("truck_id");
      expect(res.body[0]).toHaveProperty("truck_name");
    });
    it("[4] returns a list of trucks of length <= 20", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "roger", password: "1234" });

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
  });
});
