const express = require("express");
const {
  createRate,
  getRate,
  updateRate,
} = require("../controller/currencyController");
const router = express.Router();

// router.post("/", createRate);
router.get("/", getRate);
router.patch("/:newRate", updateRate);

module.exports = { currencyRoute: router };
