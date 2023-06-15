const featureSchema = require("./schema");
const mongoose = require("mongoose");

const Feature = mongoose.model("Feature", featureSchema);

module.exports = Feature;
