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
} = require("../controller/contentController");

router.post("/time", updateServiceTime);
router.get("/time/worker", workerServiceTime);
router.get("/time", getServiceTime);
router.get("/time/toggle/:settingStatus", toggleServiceTime);
router.get("/time/toggle", toggleServiceTime);

// router.post("/currency", createRate);
router.get("/currency", getRate);
router.patch("/currency/:newRate", updateRate);

router.post("/content/:name", updateContent);
router.get("/content/:name", getContent);
router.get("/content", getAllContent);

module.exports = { settingRoute: router };
