const Property = require("../models/Property");

exports.createProperty = async (req, res) => {
  try {
    const { title, description, price, location } = req.body;

    const images = req.files["images"] ? req.files["images"].map(f => f.path) : [];
    const videos = req.files["videos"] ? req.files["videos"].map(f => f.path) : [];

    const newProperty = new Property({
      title,
      description,
      price,
      location,
      owner: req.user._id, 
      images,
      videos,
    });

    await newProperty.save();
    res.status(201).json(newProperty);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find().populate("owner", "name email role");
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) return res.status(404).json({ error: "Property not found" });

    if (req.user.role !== "admin" && property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Access denied" });
    }

    Object.assign(property, req.body);
    await property.save();

    res.json(property);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ error: "Property not found" });

    if (req.user.role !== "admin" && property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Access denied" });
    }

    await property.deleteOne();
    res.json({ message: "Property deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
