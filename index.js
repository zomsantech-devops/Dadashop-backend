const mongoose = require("mongoose");
const app = require("./app.js");
const connectDB = require("./config/config.js");

connectDB("MONGODB_URI")
  .then(() => {
    app.listen(8080, () => {
      console.log(`Server is running on port ${8000}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
    process.exit(1);
  });
