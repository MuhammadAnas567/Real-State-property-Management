const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const connectDB = require('./config/db')
const User = require("./models/User");
const Property = require("./models/Property");
const Booking = require("./models/Booking");
dotenv.config();

connectDB();

const seedData = async () => {
  try {
    await User.deleteMany();
    await Property.deleteMany();
    await Booking.deleteMany();

    console.log("Old data cleared");

    const users = [];
    for (let i = 1; i <= 100; i++) {
      const user = new User({
        name: `User ${i}`,
        email: `user${i}@example.com`,
        phone: `0300${Math.floor(1000000 + Math.random() * 9000000)}`,
        password: await bcrypt.hash("123456", 10),
        role: i === 1 ? "admin" : "user",
      });
      users.push(user);
    }
    await User.insertMany(users);
    console.log("100 Users inserted");

    const properties = [];
    for (let i = 1; i <= 500; i++) {
      const owner = users[Math.floor(Math.random() * users.length)]._id;
      properties.push({
        title: `Property ${i}`,
        description: `Spacious property number ${i} with amazing features.`,
        price: Math.floor(Math.random() * 9000000) + 1000000,
        location: ["DHA", "Clifton", "Bahria Town", "Gulshan"][Math.floor(Math.random() * 4)],
        images: [`uploads/images/property${i}.jpg`],
        videos: [`uploads/videos/property${i}.mp4`],
        owner,
      });
    }
    await Property.insertMany(properties);
    console.log("500 Properties inserted");

    const bookings = [];
    for (let i = 1; i <= 200; i++) {
      const user = users[Math.floor(Math.random() * users.length)]._id;
      const property = properties[Math.floor(Math.random() * properties.length)]._id;
      bookings.push({
        user,
        property,
        status: ["pending", "confirmed", "cancelled"][Math.floor(Math.random() * 3)],
      });
    }
    await Booking.insertMany(bookings);
    console.log("200 Bookings inserted");

    console.log("All Dummy Data Seeded Successfully!");
    process.exit();
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedData();
