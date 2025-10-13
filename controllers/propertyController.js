const Property = require("../models/Property");
const { options } = require("../routes/userRoutes");
const pagination = require("../utils/pagination");

exports.createProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      city,
      address,
      amenities,
      owner,
      location,
      images,
      videos,
    } = req.body;

    let parsedAmenities =
      typeof amenities === "string" ? JSON.parse(amenities) : amenities;

    let parsedLocation =
      typeof location === "string" ? JSON.parse(location) : location;

    let imagePaths = [];

    if (req.files && req.files.images && req.files.images.length > 0) {
      imagePaths = req.files.images.map((file) => file.path);
    } else if (images && Array.isArray(images) && images.length > 0) {
      imagePaths = images;
    }

    let videoPaths = [];

    if (req.files && req.files.videos && req.files.videos.length > 0) {
      videoPaths = req.files.videos.map((file) => file.path);
    } else if (videos && Array.isArray(videos) && videos.length > 0) {
      videoPaths = videos;
    }

    const newProperty = new Property({
      title,
      description,
      price,
      city,
      address,
      amenities: parsedAmenities || [],
      images: imagePaths,
      videos: videoPaths,
      owner: owner || req.user._id,
      location: parsedLocation,
    });

    await newProperty.save();

    res.status(201).json({
      success: true,
      message: "Property created successfully",
      property: newProperty,
    });
  } catch (error) {
    console.error("Error creating property:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAllProperties = async (req, res) => {
  try {
    // const properties = await Property.find().populate(
    //   "owner",
    //   "name email role"
    // );
    const { page = 1, limit = 10 } = req.query;
    const properties = await pagination(Property, {}, { page, limit, populate: { path: "owner", select: "name email role" } });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    if (
      req.user.role !== "admin" &&
      property.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    const images = req.files?.["images"]
      ? req.files["images"].map(f => f.path)
      : Array.isArray(req.body.images)
      ? req.body.images
      : property.images;

    const videos = req.files?.["videos"]
      ? req.files["videos"].map(f => f.path)
      : Array.isArray(req.body.videos)
      ? req.body.videos
      : property.videos;
    
    Object.assign(property, req.body, { images, videos });

    await property.save();
    res.json({ message: "Property updated successfully", property });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ error: "Property not found" });

    if (
      req.user.role !== "admin" &&
      property.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    await property.deleteOne();
    res.json({ message: "Property deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
