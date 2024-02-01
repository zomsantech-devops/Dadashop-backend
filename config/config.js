const mongoose = require("mongoose");

const connectDB = async (url) => {
  try {
    await mongoose.connect(
      "mongodb+srv://dadaShop:w7MW12tcofLbC6XZ@dadausers.adhegok.mongodb.net/dadaUsers"
    );
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};
module.exports = connectDB;
