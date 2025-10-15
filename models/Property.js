const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    address: {
      type: String      
    },
    amenities: [String],
    images: {
      type: [String],
      required: true,
    },
    videos: [String],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    status: {
      type: Boolean,
      default: true,
    },
    isExpire: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ["Sale", "Rent"],
      required: true,
    }
  },
  { timestamps: true }
);

propertySchema.index({ location: "2dsphere" });
const Property = mongoose.model("Property", propertySchema);
module.exports = Property;
