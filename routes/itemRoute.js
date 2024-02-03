const express = require("express");
const router = express.Router();
const {
  dailyCheckUpdatedItem,
  initialize,
  getItems,
  getItemDetail,
} = require("../controller/itemController");

router.get("/reset", initialize);
router.get("/daily", dailyCheckUpdatedItem);
router.get("/", getItems);
router.get("/:itemId", getItemDetail);

module.exports = { itemRoute: router };
