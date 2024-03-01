const {
  getImage,
  uploadImage,
  getAllImage,
  deleteImage,
} = require("../controller/imageController");

const express = require("express");
const router = express.Router();
const compression = require("compression");

const multer = require("multer");
const { verifyAccessToken } = require("../middleware/verifyAccessToken");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/:banner", upload.single("image"), verifyAccessToken, uploadImage);
router.delete("/:banner", verifyAccessToken, deleteImage);
router.get("/:banner", compression(), getImage);
router.get("/", getAllImage);

module.exports = { imageRoute: router };
