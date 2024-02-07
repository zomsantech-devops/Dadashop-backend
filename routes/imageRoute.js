const {
  getImage,
  uploadImage,
  getAllImage,
} = require("../controller/imageController");

const express = require("express");
const router = express.Router();

const multer = require("multer");
const { verifyAccessToken } = require("../middleware/verifyAccessToken");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/:banner", upload.single("image"), verifyAccessToken, uploadImage);
router.get("/:banner", getImage);
router.get("/", getAllImage);

module.exports = { imageRoute: router };
