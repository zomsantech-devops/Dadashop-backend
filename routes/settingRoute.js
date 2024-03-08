const express = require("express");
const router = express.Router();

const {
  updateServiceTime,
  toggleServiceTime,
  getServiceTime,
  workerServiceTime,
} = require("../controller/settingController");
const {
  createRate,
  getRate,
  updateRate,
} = require("../controller/currencyController");
const {
  updateContent,
  getContent,
  getAllContent,
  deleteContent,
} = require("../controller/contentController");

const { verifyAccessToken } = require("../middleware/verifyAccessToken");

router.post("/time", verifyAccessToken, updateServiceTime);
router.get("/time/worker", verifyAccessToken, workerServiceTime);
router.get("/time", getServiceTime);
router.get("/time/toggle/:settingStatus", verifyAccessToken, toggleServiceTime);
router.get("/time/toggle", verifyAccessToken, toggleServiceTime);

// router.post("/currency", createRate);
router.get("/currency", getRate);
router.patch("/currency/:newRate", verifyAccessToken, updateRate);

router.post("/content/:name", verifyAccessToken, updateContent);
router.get("/content/:name", getContent);
router.delete("/content/:name", verifyAccessToken, deleteContent);
router.get("/content", getAllContent);

module.exports = { settingRoute: router };
