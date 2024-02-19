const express = require("express");
const router = express.Router();

const {
  createPreset,
  getAllPreset,
  updatePreset,
  getPresetById,
} = require("../controller/presetController");

router.post("/", createPreset);
router.get("/", getAllPreset);
router.get("/:id", getPresetById);
router.patch("/:id", updatePreset);

module.exports = { presetRoute: router };
