const mongoose = require("mongoose");

const userBalanceSchema = new mongoose.Schema({
  id: String,
  discord_id: String,
  discord_username: String,
  name: String,
  name_display: String,
  current_points: Number,
  total_points: Number,
  tier: String,
}, { versionKey: false });

module.exports = mongoose.model("UserBalance", userBalanceSchema, "user_balance");

