const mongoose = require("mongoose");
const { HeapAsync } = require("heap-js");

const featureSchema = new mongoose.Schema({
  type: { type: String, required: true },
  properties: {
    fill: { type: String },
  },
  geometry: {
    type: { type: String, required: true },
    coordinates: [[[Number]]],
  },
});

featureSchema.virtual("minX").get(getMinX);
featureSchema.virtual("maxX").get(getMaxX);

featureSchema.statics.getIntersectingTiles = async function (inputTile) {
  const projection = { "geometry.coordinates": 1 };
  const documents = await this.find({}, projection);
  console.info(`Number of documents fetched: ${documents.length}`);
  const heap = new HeapAsync();

  const xCoords = [];

  let inputTileDoc = {
    geometry: {
      coordinates: inputTile.geometry.coordinates,
    },
    minX: getMinX.call(inputTile),
    maxX: getMaxX.call(inputTile),
  };

  console.info("Input tile document: " + JSON.stringify(inputTileDoc, null, 2));

  for (let doc of documents) {
    getXCordsFromDoc(doc).forEach((el) => {
      xCoords.push(el);
    });
  }
  getXCordsFromDoc(inputTileDoc).forEach((el) => {
    xCoords.push(el);
  });
  console.info(`X coordinates have ${xCoords.length} number of points`);

  await heap.init(xCoords);

  let ids = new Set();

  while (!heap.isEmpty()) {
    const element = await heap.pop();

    for (let doc of documents) {
      if (
        doc.minX <= element &&
        element <= doc.maxX &&
        inputTileDoc.minX <= element &&
        element <= inputTileDoc.maxX
      ) {
        ids.add(doc._id);
      }
    }
  }
  console.info(`Ids matched ${ids.size}`);
  console.info("Returning tiles!");
  return this.find({ _id: { $in: [...ids] } });
};
function getXCordsFromDoc(doc) {
  let xCoords = [];
  const coordinates = doc.geometry.coordinates[0];
  for (let coord of coordinates) {
    xCoords.push(coord[1]);
  }
  return xCoords;
}

function getMinX() {
  const coordinates = this.geometry.coordinates[0];
  const xValues = coordinates.map((coord) => coord[1]);
  return Math.min(...xValues);
}

function getMaxX() {
  const coordinates = this.geometry.coordinates[0];
  const xValues = coordinates.map((coord) => coord[1]);
  return Math.max(...xValues);
}

module.exports = featureSchema;
