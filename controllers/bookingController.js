const { default: mongoose } = require("mongoose");
const Booking = require("../models/Booking");
const Property = require("../models/Property");
const pagination = require("../utils/pagination");

exports.createBooking = async (req, res) => {
  try {
    const { propertyId, status } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ error: "Property not found." });

    const existingBooking = await Booking.findOne({
      user: req.user._id,
      property: propertyId,
    });

    if (existingBooking) {
      return res.status(400).json({ error: "Booking already exists." });
    }

    const booking = await Booking.create({
      user: req.user._id,
      property: propertyId,
      status,
    });

    const bookingCreated = await Booking.findById(booking._id)
      .populate({
        path: "user",
        select: "-password",
      })
      .populate("property");

    res.status(201).json(bookingCreated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const bookings = await Booking.find()
      .populate("user", "id name email role")
      .populate("property")
      .skip(skip)
      .limit(Number(limit));

    const totalRecords = await Booking.countDocuments();

    res.json({
      records: bookings,
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const bookings = await pagination(
      Booking,
      { user: req.user._id },
      {
        page,
        limit,
        populate: [
          { path: "user", select: "name email role" },
          { path: "property", select: "title price city location" },
        ],
      }
    );

    if (!bookings.records.length) {
      return res.status(404).json({ message: "No bookings found for this user" });
    }

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    if (
      req.user.role !== "admin" &&
      booking.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    await booking.deleteOne();
    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.searchBooking = async (req, res) => {
  try {
    const { userId, sortByDate = "desc" } = req.query; // ?userId=xxx&sortByDate=desc

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const bookings = await Booking.aggregate([

      // Filter by user
      {
        $match: { user: userObjectId },
      },

      // Lookup user details
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },

      // Lookup property details
      {
        $lookup: {
          from: "properties",
          localField: "property",
          foreignField: "_id",
          as: "propertyDetails",
        },
      },
      { $unwind: "$propertyDetails" },

      // Project final fields
      {
        $project: {
          _id: 1,
          status: 1,
          isExpire: 1,
          date: 1,
          "userDetails.name": 1,
          "userDetails.email": 1,
          "propertyDetails.title": 1,
          "propertyDetails.location": 1,
        },
      },

      // Sort by date (default: latest first)
      {
        $sort: { date: sortByDate === "asc" ? 1 : -1 },
      },
    ]);

    // Get booking counts by status
    const bookingCounts = await Booking.aggregate([
      { $match: { user: userObjectId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Format counts
    const counts = {
      pending: bookingCounts.find((c) => c._id === "pending")?.count || 0,
      confirmed: bookingCounts.find((c) => c._id === "confirmed")?.count || 0,
      cancelled: bookingCounts.find((c) => c._id === "cancelled")?.count || 0,
    };

    res.status(200).json({
      success: true,
      message: "User bookings fetched successfully",
      counts,
      totalBookings: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};


exports.confirmBooking = async (req, res) => {
  try {
    const { bookingId, propertyId, status = "confirmed" } = req.body;
    const userId = req.user._id;

    if (bookingId) {
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({ success: false, message: "Booking not found." });
      }

      booking.status = status;
      await booking.save();

      const updatedBooking = await Booking.findById(booking._id)
        .populate({ path: "user", select: "-password" })
        .populate("property");

      return res.status(200).json({
        success: true,
        message: `Booking status updated to '${status}'.`,
        booking: updatedBooking,
      });
    }

    if (!propertyId) {
      return res.status(400).json({
        success: false,
        message: "propertyId is required when creating a new booking.",
      });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found." });
    }

    const existingBooking = await Booking.findOne({ user: userId, property: propertyId });

    if (existingBooking) {
      existingBooking.status = status;
      await existingBooking.save();

      const updatedBooking = await Booking.findById(existingBooking._id)
        .populate({ path: "user", select: "-password" })
        .populate("property");

      return res.status(200).json({
        success: true,
        message: `Existing booking updated to '${status}'.`,
        booking: updatedBooking,
      });
    }

    const newBooking = await Booking.create({
      user: userId,
      property: propertyId,
      status,
    });

    const bookingCreated = await Booking.findById(newBooking._id)
      .populate({ path: "user", select: "-password" })
      .populate("property");

    return res.status(201).json({
      success: true,
      message: "Booking created successfully.",
      booking: bookingCreated,
    });
  } catch (error) {
    console.error("Error confirming booking:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while confirming booking.",
      error: error.message,
    });
  }
};

exports.  cancelledBooking = async (req, res) => { 
  try {
    const { bookingId, propertyId, status = "cancelled" } = req.body;
    const userId = req.user._id;

    if (bookingId) {
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({ success: false, message: "Booking not found." });
      }

      booking.status = status;
      await booking.save();

      const updatedBooking = await Booking.findById(booking._id)
        .populate({ path: "user", select: "-password" })
        .populate("property");

      return res.status(200).json({
        success: true,
        message: `Booking status updated to '${status}'.`,
        booking: updatedBooking,
      });
    }

    if (!propertyId) {
      return res.status(400).json({
        success: false,
        message: "propertyId is required to cancel a booking.",
      });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found." });
    }

    const existingBooking = await Booking.findOne({ user: userId, property: propertyId });

    if (existingBooking) {
      existingBooking.status = status;
      await existingBooking.save();

      const updatedBooking = await Booking.findById(existingBooking._id)
        .populate({ path: "user", select: "-password" })
        .populate("property");

      return res.status(200).json({
        success: true,
        message: `Existing booking updated to '${status}'.`,
        booking: updatedBooking,
      });
    }

    return res.status(404).json({
      success: false,
      message: "No existing booking found to cancel.",
    });

  } catch (error) {
    console.error("Error cancelling booking:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while cancelling booking.",
      error: error.message,
    });
  }
};

exports.getAllBookingsCounts = async (req, res) => {
  try {
    const { sortByDate = "desc" } = req.query; // ?sortByDate=desc

    const bookings = await Booking.aggregate([
      // Lookup user details
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },

      // Lookup property details
      {
        $lookup: {
          from: "properties",
          localField: "property",
          foreignField: "_id",
          as: "propertyDetails",
        },
      },
      { $unwind: "$propertyDetails" },

      // Project fields
      {
        $project: {
          _id: 1,
          status: 1,
          isExpire: 1,
          date: 1,
          "userDetails.name": 1,
          "userDetails.email": 1,
          "propertyDetails.title": 1,
          "propertyDetails.location": 1,
        },
      },

      // Sort by date (latest first by default)
      {
        $sort: { date: sortByDate === "asc" ? 1 : -1 },
      },
    ]);

    // Get booking counts grouped by status
    const bookingCounts = await Booking.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Format counts safely
    const counts = {
      pending: bookingCounts.find((c) => c._id === "pending")?.count || 0,
      confirmed: bookingCounts.find((c) => c._id === "confirmed")?.count || 0,
      cancelled: bookingCounts.find((c) => c._id === "cancelled")?.count || 0,
    };

    res.status(200).json({
      success: true,
      message: "All bookings fetched successfully",
      counts,
      totalBookings: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Error fetching all bookings:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
