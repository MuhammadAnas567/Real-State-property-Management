const cron = require("node-cron");
const Property = require("./models/Property");
const Booking = require("./models/Booking");

// 🕐 Run every 1 minute

const jobTiming = "0 0 * * *"; // every day at midnight

cron.schedule(jobTiming, async () => {
  try {
    console.log("⏰ Running cron job every day at midnight...");

    // Get the current date safely
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    // 🏠 Update properties older than 30 days
    const propertyResult = await Property.updateMany(
      { createdAt: { $lte: thirtyDaysAgo } },
      { $set: { isExpire: true } }
    );

    // 📅 Update bookings older than 30 days
    const bookingResult = await Booking.updateMany(
      { createdAt: { $lte: thirtyDaysAgo } },
      { $set: { isExpire: true } }
    );

    console.log(
      `✅ Updated ${propertyResult.modifiedCount} properties and ${bookingResult.modifiedCount} bookings`
    );
  } catch (error) {
    console.error("❌ Error running cron job:", error.message);
  }
});
