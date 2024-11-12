require("dotenv").config();
require("express-async-errors");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Home page
app.get("/api/v1", (req, res) => {
  res.send("Home page");
});

// Start the server
const start = async () => {
  console.log(`Server is listening on port ${port}`);
};

start();
