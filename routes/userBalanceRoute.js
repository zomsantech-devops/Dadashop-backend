const express = require("express");
const router = express.Router();

const { verifyAccessToken } = require("../middleware/verifyAccessToken");

const {
  getAllUser,
  getSingleUser,
  updateSingleUser,
  createuser,
} = require("../controller/userBalanceController");
router.get("/", getAllUser);

router.post("/", verifyAccessToken, createuser);

router.get("/:input", getSingleUser);

router.post("/:input", verifyAccessToken, updateSingleUser);

module.exports = { userBalanceRoute: router };
