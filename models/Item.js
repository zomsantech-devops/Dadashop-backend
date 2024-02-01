const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  id: String,
  type_id: String,
  type_name: String,
  name: String,
  description: String,
  rarity_id: String,
  images_background: String,
  images_full_background: String,
  finalPrice: Number,
  time_fetch: Date,
  time_update: Date,
  uid_update: String,
});

module.exports = mongoose.model("Item", itemSchema);
