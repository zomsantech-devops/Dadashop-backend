const mongoose = require("mongoose");

const connectDB = async (url) => {
  try {
    await mongoose.connect(
      "mongodb+srv://vercel-admin-user-65bd6672c873a634a7ba330b:1NVS74mDd8BjdoWi@dadashopdb.tznxb50.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
    );
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};
module.exports = connectDB;
