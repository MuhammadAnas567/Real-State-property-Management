const express = require("express");
const router = express.Router();
const { createBooking, getAllBookings, getMyBookings, deleteBooking } = require("../controllers/bookingController");
const { authMiddleware, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createBooking);
router.get("/", authMiddleware, authorizeRoles("admin"), getAllBookings);
router.get("/my", authMiddleware, getMyBookings);
router.delete("/:id", authMiddleware, deleteBooking);

module.exports = router;
