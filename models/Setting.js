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
    status: {
      type: String,
      enum: ["OPEN", "CLOSED", "MAINTENANCE"],
    },
  },
  { timestamps: true }
);

const ServiceTime = mongoose.model("ServiceTime", settingSchema);

module.exports = {
  ExchangeRate,
  ServiceTime,
};
