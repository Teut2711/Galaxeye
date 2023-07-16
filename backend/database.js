const mongoose = require("mongoose");
const fs = require("fs").promises;
const path = require("path");
const Feature = require("./models");

const url = process.env.DATABASE_URI || "mongodb://localhost:27017/galaxeye";
console.info("Mongo url: ", url);

async function connectToDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.info("Connected successfully to the database");
    loadFixture();
  } catch (error) {
    console.error("Failed to connect to the database:", error);
  }
}

async function loadFixture() {
  try {
    const count = await Feature.countDocuments();
    if (count === 0) {
      const fixturePath = path.join(__dirname, "karnataka.geojson");
      const data = await fs.readFile(fixturePath, "utf8");
      const fixture = JSON.parse(data)["features"];

      await Feature.insertMany(fixture);
      console.info("Fixture loaded successfully");
    } else {
      console.info("Collection is not empty. Skipping fixture loading.");
    }
  } catch (err) {
    console.info("Fixture loading failed: " + err.message);
  }
}
module.exports = connectToDatabase;
