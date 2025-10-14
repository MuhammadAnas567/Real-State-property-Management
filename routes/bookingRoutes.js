const express = require("express");
const router = express.Router();
const { createBooking, getAllBookings, getMyBookings, deleteBooking, searchBooking, confirmBooking, cancelledBooking, getAllBookingsCounts } = require("../controllers/bookingController");
const { authMiddleware, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createBooking);
router.get("/", authMiddleware, authorizeRoles("admin"), getAllBookings);
router.get("/my", authMiddleware, getMyBookings);
router.delete("/:id", authMiddleware, deleteBooking);
router.get("/searchbooking", authMiddleware, searchBooking);
router.post("/confirmbooking", authMiddleware, confirmBooking);
router.post("/cancelledbooking", authMiddleware, cancelledBooking);
router.get("/getallbookingcounts", authMiddleware, getAllBookingsCounts);

module.exports = router;
