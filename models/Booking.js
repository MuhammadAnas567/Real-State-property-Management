const mongoose = require ("mongoose");

const bookingSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, ref: "User" 
    },
  property: { 
    type: mongoose.Schema.Types.ObjectId, ref: "Property" 
   },
    date: {
     type: Date,
    default: Date.now 
  },
  status: { 
    type: String,
    enum: ["pending", "confirmed", "cancelled"],
    default: "pending" 
  }
},
{ timestamps: true }
);

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
