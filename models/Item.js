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
  display_assets: [
    {
      display_id: String,
      image_url: String,
      image_background: String,
      image_full_background: String,
    },
  ],
  section_name: String,
  finalPrice: Number,
  release_date: Date,
  time_fetch: Date,
  time_update: Date,
  uid_update: String,
});

module.exports = mongoose.model("Item", itemSchema);
