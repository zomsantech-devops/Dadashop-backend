const mongoose = require("mongoose");

const exchangeRateSchema = new mongoose.Schema(
  {
    rates: [
      {
        min_dadacoin: { type: Number, required: true },
        max_dadacoin: { type: Number, required: true },
        rate_in_baht: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

const ExchangeRate = mongoose.model("ExchangeRate", exchangeRateSchema);

const settingSchema = new mongoose.Schema(
  {
    open_time: { type: String, required: true },
    close_time: { type: String, required: true },
    is_maintenance: { type: Boolean, default: false },
    is_available: { type: Boolean, default: true },
    is_open_early: { type: Boolean, default: false },
    is_close_early: { type: Boolean, default: false },
    is_extended_hours: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["OPEN", "CLOSED", "MAINTENANCE"],
    },
  },
  { timestamps: true }
);

const ServiceTime = mongoose.model("ServiceTime", settingSchema);

const presetSchema = new mongoose.Schema({
  image: { type: String, required: true },
  title: { type: String, required: true },
  list: [
    {
      content: { type: String, required: true },
      color: { type: String, required: true },
    },
  ],
  button: {
    name: { type: String, required: true },
    link: { type: String, required: false },
    color: {
      from: { type: String, required: false },
      via: { type: String, required: false },
      to: { type: String, required: false },
    },
  },
  location: { type: String, required: false },
  preset_id: { type: String, required: true },
});

const Preset = mongoose.model("Preset", presetSchema);

const currencySchema = new mongoose.Schema({
  min: { type: Number, required: true },
  max: { type: Number, required: true },
  rate: { type: Number, required: true },
});

const currencyRate = mongoose.model("currencyRate", currencySchema);

module.exports = {
  ExchangeRate,
  ServiceTime,
  Preset,
  currencyRate,
};
