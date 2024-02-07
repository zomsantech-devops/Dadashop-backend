const express = require("express");
const { loginAuth } = require("../controller/authController");
const router = express.Router();

router.post("/login", loginAuth);

module.exports = { authRoute: router };
