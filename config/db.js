const mongoose = require("mongoose");

async function connectDB () {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.log("DB Connection Failed:", error.message);
  }
};
module.exports = connectDB;
