const express = require("express");
const { loginAuth, authenticateAuth } = require("../controller/authController");
const { verifyAccessToken } = require("../middleware/verifyAccessToken");
const router = express.Router();

router.post("/login", loginAuth);

router.get("/protected", verifyAccessToken, authenticateAuth);

module.exports = { authRoute: router };
