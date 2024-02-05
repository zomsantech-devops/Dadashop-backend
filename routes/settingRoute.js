const express = require("express");
const router = express.Router();

const {
  updateServiceTime,
  toggleServiceTime,
  getServiceTime,
} = require("../controller/settingController");

router.post("/time", updateServiceTime);
router.get("/time", getServiceTime);
router.get("/time/toggle/:settingStatus", toggleServiceTime);
router.get("/time/toggle", toggleServiceTime);

module.exports = { settingRoute: router };
