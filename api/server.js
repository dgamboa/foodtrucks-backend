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
// const [  ]Router = require("./")
// const [  ]Router = require("./")
// server.use("/api/[  ]", [  ]Router)
// server.use("/api/[  ]", [  ]Router)

server.get("/", (req, res) => {
  res.status(200).json({ message: "API is up" });
});

module.exports = server;
