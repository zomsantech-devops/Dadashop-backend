const { getImage, uploadImage } = require("../controller/imageController");

const express = require("express");
const router = express.Router();

const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/:banner", upload.single("image"), uploadImage);
router.get("/:banner", getImage);

module.exports = { imageRoute: router };
