const { getImage } = require("../controller/imageController");

const express = require("express");
const router = express.Router();

router.route("/").get(getImage);

module.exports = { imageRoute: router };
