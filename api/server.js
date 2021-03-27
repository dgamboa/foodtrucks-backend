// Dependencies
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

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
server.use("/api/users", usersRouter);

const trucksRouter = require("./trucks/trucks-router");
server.use("/api/trucks", trucksRouter);

server.get("/", (req, res) => {
  res.status(200).json({ message: "API is up" });
});

module.exports = server;
