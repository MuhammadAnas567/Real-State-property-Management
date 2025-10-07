const Property = require("../models/Property");

const createProperty = async (req, res) => {
  try {
    const { title, description, price, location, owner } = req.body;

    const images = req.files['images'] ? req.files['images'].map(file => file.path) : [];
    const videos = req.files['videos'] ? req.files['videos'].map(file => file.path) : [];

    const newProperty = new Property({
      title,
      description,
      price,
      location,
      owner,
      images,
      videos,
    });

    await newProperty.save();
    res.status(201).json(newProperty);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find().populate("owner");
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(property);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteProperty = async (req, res) => {
  try {
    await Property.findByIdAndDelete(req.params.id);
    res.json({ message: "Property deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createProperty,
  getAllProperties,
  updateProperty,
  deleteProperty,
};
