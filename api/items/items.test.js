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
});
