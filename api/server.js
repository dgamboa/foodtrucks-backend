// Dependencies
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const {restricted} = require("./auth/auth-middleware")

// Server Instance
const server = express();

// Middleware
server.use(helmet());
server.use(cors());
server.use(express.json());

// API Routers
const authRouter = require("./auth/auth-router");
server.use("/api/auth", authRouter);

const usersRouter = require("./users/users-router");
server.use("/api/users", restricted, usersRouter);

const trucksRouter = require("./trucks/trucks-router");
server.use("/api/trucks", restricted, trucksRouter);

const itemsRouter = require("./items/items-router");
server.use("/api/items", restricted, itemsRouter);

server.get("/", (req, res) => {
  res.status(200).json({ message: "API is up" });
});

module.exports = server;
