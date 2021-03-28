const request = require("supertest");
const server = require("./server");
const db = require("./data/db-config");
const bcrypt = require("bcryptjs");
const jwtDecode = require("jwt-decode");

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
  describe("[GET] /api/users/:id", () => {
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
      expect(usersRes).toHaveProperty("user_id");
      expect(usersRes).toHaveProperty("username");
      expect(usersRes).toHaveProperty("email");
      expect(usersRes).toHaveProperty("user_lat");
      expect(usersRes).toHaveProperty("user_long");
      expect(usersRes).toHaveProperty("favorite_trucks");
      expect(usersRes).toHaveProperty("trucks_owned");
    });
    it("[4] requests with valid token return the right user", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "roger", password: "1234" });
      const usersRes = await request(server)
        .get("/api/users/1")
        .set("Authorization", loginRes.body.token);
      expect(usersRes).toMatchObject({ user_id: 1, username: "roger" });
    });
    it("[5] requests with valid token can't access other users", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "roger", password: "1234" });
      console.log(loginRes.body.token);
      const usersRes = await request(server)
        .get("/api/users/2")
        .set("Authorization", loginRes.body.token);
      expect(usersRes.body.message).toMatch(/invalid credentials/i);
      expect(usersRes.status).toBe(401);
    });
  });
});
