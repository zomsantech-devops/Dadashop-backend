require("dotenv/config");

const MONGODB_URI = process.env.MONGODB_URI;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const TZ = process.env.TZ;

module.exports = { MONGODB_URI, ACCESS_TOKEN_SECRET, TZ };
