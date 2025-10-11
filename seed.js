const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const { faker } = require("@faker-js/faker");
const User = require("./models/User");
const Property = require("./models/Property");
const Booking = require("./models/Booking");
const connectDB = require("./config/db");

dotenv.config();

connectDB();

async function seedData() {
  try {
    console.log("Clearing old data...");
    await User.deleteMany();
    await Property.deleteMany();
    await Booking.deleteMany();

    console.log("Creating 100 Users...");
    const users = [];
    for (let i = 0; i < 100; i++) {
      const hashedPassword = await bcrypt.hash("123456", 10);
      users.push({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: hashedPassword,
        role: i < 5 ? "admin" : "user", 
      });
    }

    const createdUsers = await User.insertMany(users);

    console.log("Creating 500 Properties...");
    const propertyTypes = ["Apartment", "House", "Villa", "Flat", "Studio"];
    const cities = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Multan", "Peshawar"];
    const amenitiesList = ["WiFi", "Parking", "Pool", "Gym", "AC", "Balcony"];

    const properties = [];
    for (let i = 0; i < 500; i++) {
      const randomOwner = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      const randomCity = cities[Math.floor(Math.random() * cities.length)];
      const randomType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
      const randomAmenities = faker.helpers.arrayElements(amenitiesList, 3);

      properties.push({
        title: faker.company.catchPhrase(),
        description: faker.lorem.paragraph(),
        price: faker.number.int({ min: 10000, max: 300000 }),
        type: randomType,
        city: randomCity,
        amenities: randomAmenities,
        owner: randomOwner._id,
        location: {
          type: "Point",
          coordinates: [
            67.00 + Math.random(),
            24.80 + Math.random(), 
          ],
        },
      });
    }

    const createdProperties = await Property.insertMany(properties);

    console.log("Creating 200 Bookings...");
    const bookings = [];
    for (let i = 0; i < 200; i++) {
      const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      const randomProperty = createdProperties[Math.floor(Math.random() * createdProperties.length)];

      const checkIn = faker.date.soon({ days: 30 });
      const checkOut = new Date(checkIn);
      checkOut.setDate(checkOut.getDate() + faker.number.int({ min: 1, max: 10 }));

      bookings.push({
        user: randomUser._id,
        property: randomProperty._id,
        status: "confirmed",
        checkInDate: checkIn,
        checkOutDate: checkOut,
      });
    }

    await Booking.insertMany(bookings);

    console.log("Data Seeded Successfully!");
    process.exit();
  } catch (error) {
    console.error("Seeding Failed:", error);
    process.exit(1);
  }
}

seedData();
