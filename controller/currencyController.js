const { currencyRate } = require("../models/Setting");

const calculateRate = (amount) => {
  const rates = [
    { min: 0, max: 500, rate: 5 },
    { min: 500, max: 1000, rate: 6 },
  ];

  let totalCost = 0;

  for (let i = 0; i < rates.length; i++) {
    const { min, max, rate } = rates[i];
    if (amount > min) {
      let chargeableAmount = Math.min(amount, max) - min;
      totalCost += (chargeableAmount / 100) * rate;
      if (amount <= max) {
        break;
      }
    }
  }

  return totalCost;
};

const createRate = async (req, res) => {
  try {
    const { min, max, rate } = req.body;

    const overlappingRate = await currencyRate.findOne({
      $or: [{ min: { $lt: max }, max: { $gt: min } }],
    });

    if (overlappingRate) {
      return res
        .status(400)
        .json({ message: "Rate range overlaps with an existing rate." });
    }

    const newRate = new currencyRate({ min, max, rate });
    await newRate.save();

    res
      .status(201)
      .json({ message: "Rate added successfully.", data: newRate });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateRate = async (req, res) => {
  try {
    const { newRate } = req.params;

    if (!newRate) {
      return res
        .status(400)
        .json({ success: false, message: "New rate not found" });
    }

    const existingRate = await currencyRate.findOne({});

    if (!existingRate) {
      return res
        .status(400)
        .json({ success: false, message: "Rate setting not found" });
    }

    existingRate.rate = newRate;

    existingRate.save();

    return res.status(200).json({
      success: true,
      message: "Rate updated successfully.",
      data: existingRate,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

const getRate = async (req, res) => {
  try {
    const existingRate = await currencyRate.findOne({});

    const rate = existingRate.rate;

    if (!existingRate) {
      return res
        .status(400)
        .json({ success: false, message: "Rate setting not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Rate updated successfully.",
      data: { rate },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = {
  calculateRate,
  createRate,
  updateRate,
  getRate,
};
