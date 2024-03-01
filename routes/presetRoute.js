const express = require("express");
const router = express.Router();

const {
  createPreset,
  getAllPreset,
  updatePreset,
  getPresetById,
  deletePreset,
} = require("../controller/presetController");

const { verifyAccessToken } = require("../middleware/verifyAccessToken");

router.post("/", verifyAccessToken, createPreset);
router.delete("/:id", verifyAccessToken, deletePreset);
router.get("/", getAllPreset);
router.get("/:id", getPresetById);
router.patch("/:id", verifyAccessToken, updatePreset);

module.exports = { presetRoute: router };
