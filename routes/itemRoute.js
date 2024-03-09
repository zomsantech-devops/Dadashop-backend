const express = require("express");
const router = express.Router();
const {
  dailyCheckUpdatedItem,
  initialize,
  getItems,
  getItemDetail,
  deleteAllItemDetail,
} = require("../controller/itemController");
const { verifyAccessToken } = require("../middleware/verifyAccessToken");

router.get("/reset", initialize);
router.get("/daily", dailyCheckUpdatedItem);
router.get("/", getItems);
router.delete("/", verifyAccessToken, deleteAllItemDetail);
router.get("/:itemId", getItemDetail);

module.exports = { itemRoute: router };
