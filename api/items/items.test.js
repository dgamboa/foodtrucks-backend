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
});
