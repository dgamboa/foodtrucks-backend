const request = require("supertest");
const server = require("../server");
const db = require("../data/db-config");
const bcrypt = require("bcryptjs");

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
  await request(server)
    .post("/api/auth/register")
    .send({ username: "roger", email: "roger@test.com", password: "1234" });
  await request(server)
    .post("/api/auth/register")
    .send({ username: "claire", email: "claire@test.com", password: "1234" });
  await request(server)
    .post("/api/auth/register")
    .send({ username: "nancy", email: "nancy@test.com", password: "1234" });
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

  describe("[PUT] /api/users/:user_id", () => {
    it("[1] requests without a token are rejected with right status and message", async () => {
      const res = await request(server).put("/api/users/1");
      expect(res.body.message).toMatch(/token required/i);
    });
    it("[2] requests with invalid token are rejected with right status and message", async () => {
      const res = await request(server)
        .put("/api/users/1")
        .set("Authorization", "qwerty");
      expect(res.body.message).toMatch(/token invalid/i);
    });
    it("[3] successfully edits an user object", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "nancy", password: "1234" });

      const putRes = await request(server)
        .put("/api/users/3")
        .set("Authorization", loginRes.body.token)
        .send({
          email: "jane@test.com",
          user_lat: 43.4752,
          user_long: -110.7669,
        });
      const userEdited = await db("users")
        .where("user_id", putRes.body.user.user_id)
        .first();
      expect(userEdited).toMatchObject({
        email: "jane@test.com",
        user_lat: 43.4752,
        user_long: -110.7669,
      });
    });
    it("[4] responds with correct status and message on successful edit", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "nancy", password: "1234" });
      const putRes = await request(server)
        .put("/api/users/3")
        .set("Authorization", loginRes.body.token)
        .send({
          email: "sarah@test.com",
          user_lat: 43.4755,
        });
      expect(putRes.body.message).toMatch(/user .* updated/i);
      expect(putRes.status).toBe(200);
    });
    it("[5] responds with updated user on successful edit", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "nancy", password: "1234" });
      const putRes = await request(server)
        .put("/api/users/3")
        .set("Authorization", loginRes.body.token)
        .send({
          email: "sabrina@test.com",
          user_lat: 43.4743,
        });
      expect(putRes.body.user).toMatchObject({
        email: "sabrina@test.com",
        user_lat: 43.4743,
      });
    });
    it("[6] fails to update when the logged in user doesn't match the user to update", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "roger", password: "1234" });
      const putRes = await request(server)
        .put("/api/users/3")
        .set("Authorization", loginRes.body.token)
        .send({
          email: "marie@test.com",
        });
      expect(putRes.body.message).toMatch(/invalid credentials/i);
      expect(putRes.status).toBe(401);
    });
  });

  describe("[PUT] /api/users/:user_id/password", () => {
    it("[1] requests without a token are rejected with right status and message", async () => {
      const res = await request(server).put("/api/users/1/password");
      expect(res.body.message).toMatch(/token required/i);
    });
    it("[2] requests with invalid token are rejected with right status and message", async () => {
      const res = await request(server)
        .put("/api/users/1/password")
        .set("Authorization", "qwerty");
      expect(res.body.message).toMatch(/token invalid/i);
    });
    it("[3] successfully edits an user's password", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "nancy", password: "1234" });

      const res = await request(server)
        .put("/api/users/3/password")
        .set("Authorization", loginRes.body.token)
        .send({
          old_password: "1234",
          new_password: "5678",
        });
      const userEdited = await db("users")
        .where("user_id", 3)
        .first();
      expect(bcrypt.compareSync("5678", userEdited.password)).toBeTruthy();
    });
    it("[4] responds with correct status and message on successful edit", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "nancy", password: "5678" });
      const putRes = await request(server)
        .put("/api/users/3/password")
        .set("Authorization", loginRes.body.token)
        .send({
          old_password: "5678",
          new_password: "9101",
        });
      expect(putRes.body.message).toMatch(/password .* updated/i);
      expect(putRes.status).toBe(200);
    });
    it("[5] fails to update if old password is wrong", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "nancy", password: "9101" });
      const putRes = await request(server)
        .put("/api/users/3/password")
        .set("Authorization", loginRes.body.token)
        .send({
          old_password: "0000",
          new_password: "1111",
        });
        expect(putRes.body.message).toMatch(/invalid credentials/i);
        expect(putRes.status).toBe(401);
    });
    it("[6] fails to update when the logged in user doesn't match the user to update", async () => {
      const loginRes = await request(server)
        .post("/api/auth/login")
        .send({ username: "roger", password: "1234" });
      const putRes = await request(server)
        .put("/api/users/3/password")
        .set("Authorization", loginRes.body.token)
        .send({
          old_password: "1234",
          new_password: "0000",
        });
      expect(putRes.body.message).toMatch(/invalid credentials/i);
      expect(putRes.status).toBe(401);
    });
  });
});
