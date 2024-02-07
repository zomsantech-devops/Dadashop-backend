require("dotenv/config");

const MONGODB_URI = process.env.MONGODB_URI;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

module.exports = { MONGODB_URI, ACCESS_TOKEN_SECRET };
