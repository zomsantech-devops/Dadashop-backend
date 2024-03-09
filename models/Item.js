const mongoose = require("mongoose");
const moment = require("moment-timezone");
const now = moment.utc();

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
      parent_id: String,
      parent_final_price: Number,
    },
  ],
  section_name: String,
  finalPrice: Number,
  release_date: Date,
  time_fetch: Date,
  time_update: Date,
  uid_update: String,
});

const Item = mongoose.model("Item", itemSchema);

const StyleSchema = new mongoose.Schema({
  name: String,
  channel: String,
  channelName: String,
  tag: String,
  isDefault: Boolean,
  startUnlocked: Boolean,
  hideIfNotOwned: Boolean,
  image: String,
  video_url: String,
});

const ItemDetailSchema = new mongoose.Schema({
  id: String,
  type: {
    id: String,
    name: String,
  },
  name: String,
  description: String,
  rarity: {
    id: String,
    name: String,
  },
  series: { Object },
  price: Number,
  added: {
    date: String,
    version: String,
  },
  upcoming: Boolean,
  reactive: Boolean,
  releaseDate: String,
  lastAppearance: String,
  interest: Number,
  images: {
    icon: String,
    featured: String,
    background: String,
    icon_background: String,
    full_background: String,
  },
  video: String,
  audio: String,
  path: String,
  gameplayTags: [String],
  apiTags: [String],
  searchTags: [String],
  introduction: {
    chapter: String,
    season: String,
    text: String,
  },
  displayAssets: [
    {
      displayAsset: String,
      materialInstance: String,
      primaryMode: String,
      url: String,
      background: String,
      full_background: String,
    },
  ],
  shopHistory: [String],
  styles: [StyleSchema],
  previewVideos: [
    {
      url: String,
      styles: [Object],
    },
  ],
  grants: [Object],
  fetchDate: {
    type: Date,
    default: () => moment.utc().toDate(),
  },
});

const ItemDetail = mongoose.model("ItemDetail", ItemDetailSchema);

module.exports = {
  Item,
  ItemDetail,
};
