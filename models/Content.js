const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema({
  name: String,
  content: String,
});

module.exports = mongoose.model("Content", contentSchema);
