const express = require("express");
const {
  createRate,
  getRate,
  updateRate,
} = require("../controller/currencyController");
const { verifyAccessToken } = require("../middleware/verifyAccessToken");

const router = express.Router();

// router.post("/", createRate);
router.get("/", getRate);
router.patch("/:newRate", verifyAccessToken, updateRate);

module.exports = { currencyRoute: router };
