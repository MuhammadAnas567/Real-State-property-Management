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


exports.searchProperties = async (req, res) => {
  try {
    const {
      keyword,
      minPrice,
      maxPrice,
      city,
      amenities,
      lat,
      lng,
      distance,
      sortBy,
    } = req.query;

    const pipeline = [];

    
    if (lat && lng && distance) {
      pipeline.push({
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          distanceField: "distance",
          maxDistance: parseFloat(distance) * 1000, // km -> meters
          spherical: true,
        },
      });
    }

    
    const matchStage = {};

    if (keyword) {
      matchStage.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ];
    }

    if (minPrice || maxPrice) {
      matchStage.price = {};
      if (minPrice) matchStage.price.$gte = parseFloat(minPrice);
      if (maxPrice) matchStage.price.$lte = parseFloat(maxPrice);
    }

    if (city) {
      matchStage.city = { $regex: city, $options: "i" };
    }

    if (amenities) {
      const amenitiesArray = amenities.split(",");
      matchStage.amenities = { $all: amenitiesArray };
    }

    
    matchStage.status = true;
    matchStage.isExpire = false;

    pipeline.push({ $match: matchStage });

    
    if (sortBy === "priceLowToHigh") {
      pipeline.push({ $sort: { price: 1 } });
    } else if (sortBy === "priceHighToLow") {
      pipeline.push({ $sort: { price: -1 } });
    } else {
      pipeline.push({ $sort: { createdAt: -1 } });
    }

    
    const properties = await Property.aggregate(pipeline);

    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
