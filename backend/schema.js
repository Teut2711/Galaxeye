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
featureSchema.virtual("minY").get(getMinY);
featureSchema.virtual("maxY").get(getMaxY);

featureSchema.statics.getIntersectingTiles = async function (inputTile) {
  const projection = { "geometry.coordinates": 1 };
  const documents = await this.find({}, projection);
  console.info(`Number of documents fetched: ${documents.length}`);

  let inputTileDoc = {
    geometry: {
      coordinates: inputTile.geometry.coordinates,
    },
    minX: getMinX.call(inputTile),
    maxX: getMaxX.call(inputTile),
    minY: getMinY.call(inputTile),
    maxY: getMaxY.call(inputTile),
  };

  console.info("Input tile document: " + JSON.stringify(inputTileDoc, null, 2));
  const XIDs = await getXIds(documents, inputTileDoc);
  const YIDs = await getYIds(
    documents.filter(({ _id }) => XIDs.includes(_id)),
    inputTileDoc
  );
  console.info(`Ids matched ${YIDs.size}`);
  console.info("Returning tiles!");
  return this.find({ _id: { $in: [...YIDs] } });
};

async function getXIds(documents, inputTileDoc) {
  const heap = new HeapAsync();

  const xCoords = [];

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
  return [...ids];
}

async function getYIds(documents, inputTileDoc) {
  const heap = new HeapAsync();

  const yCoords = [];

  for (let doc of documents) {
    getYCordsFromDoc(doc).forEach((el) => {
      yCoords.push(el);
    });
  }
  getYCordsFromDoc(inputTileDoc).forEach((el) => {
    yCoords.push(el);
  });
  console.info(`X coordinates have ${yCoords.size} number of points`);

  await heap.init(yCoords);

  let ids = new Set();

  while (!heap.isEmpty()) {
    const element = await heap.pop();

    for (let doc of documents) {
      if (
        doc.minY <= element &&
        element <= doc.maxY &&
        inputTileDoc.minY <= element &&
        element <= inputTileDoc.maxY
      ) {
        ids.add(doc._id);
      }
    }
  }
  return [...ids];
}

function getXCordsFromDoc(doc) {
  let xCoords = [];
  const coordinates = doc.geometry.coordinates[0];
  for (let coord of coordinates) {
    xCoords.push(coord[1]);
  }
  return xCoords;
}

function getYCordsFromDoc(doc) {
  let yCoords = [];
  const coordinates = doc.geometry.coordinates[0];
  for (let coord of coordinates) {
    yCoords.push(coord[0]);
  }
  return yCoords;
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

function getMinY() {
  const coordinates = this.geometry.coordinates[0];
  const yValues = coordinates.map((coord) => coord[0]);
  return Math.min(...yValues);
}

function getMaxY() {
  const coordinates = this.geometry.coordinates[0];
  const yValues = coordinates.map((coord) => coord[0]);
  return Math.max(...yValues);
}

module.exports = featureSchema;
