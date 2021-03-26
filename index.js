// Dependencies
require("dotenv").config();

// Express Server Instance
const server = require("./api/server");

// Port and Listen
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
