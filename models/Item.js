const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  id: String,
  type_id: String,
  type_name: String,
  name: String,
  description: String,
  rarity_id: String,
  rarity_name: String,
  images_texture_background: String,
  images_item: String,
  images_background: String,
  images_full_background: String,
  section_name: String,
  finalPrice: Number,
  time_fetch: Date,
  time_update: Date,
  uid_update: String,
});

module.exports = mongoose.model("Item", itemSchema);
