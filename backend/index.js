"use strict";
const express = require("express");
const connectToDatabase = require("./database");
const Feature = require("./models");

const port = parseInt(process.env.PORT) || 8000;

const app = express();

app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.route("/api/v1/tile").post(async (req, res) => {
  try {
    const { data } = req.body;
    console.info("Received request!: ", data);
    console.info("Finding tiles...");
    const tiles = await Feature.getIntersectingTiles(data);

    console.info("Received tiles =", tiles.length);
    console.info("Example tile: ", tiles.slice(0, 1));

    res.status(200).json({
      status: "success",
      data: tiles,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: "error",
      message: `Error :\n${err.message}`,
    });
  }
});

app.listen(port, () => {
  connectToDatabase();
  console.log(`App listening on port ${port}`);
});
