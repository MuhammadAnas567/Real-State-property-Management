const User = require ("../models/User.js");

exports.createUser = async (req, res) => {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const user = await User.create({ name, email, phone });
    res.status(201).json({user});
};

exports.getAllUsers = async (req, res) => {
  const users = await User.find({});
  res.json(users);
};

exports.getUserById = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' })
};

exports.updateUserById = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(user);
};

exports.deleteUserById = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
};