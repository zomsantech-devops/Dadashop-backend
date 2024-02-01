const express = require("express");
const router = express.Router();
const {
  dailyCheckUpdatedItem,
  initialize,
  getItems,
} = require("../controller/itemController");

router.get("/reset", initialize);
router.get("/daily", dailyCheckUpdatedItem);
router.get("/", getItems);

module.exports = { itemRoute: router };
