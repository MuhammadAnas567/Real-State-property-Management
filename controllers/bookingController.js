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
