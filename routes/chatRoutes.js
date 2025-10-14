const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const Chat = require("../models/Chat");
const router = express.Router();


router.post("/sendmessage", authMiddleware, async (req, res) => {
  try {
    const { receiverId, message } = req.body;

    const chat = await Chat.create({
      sender: req.user._id,
      receiver: receiverId,
      message,
    });

    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all messages between two users
router.get("/:receiverId", authMiddleware, async (req, res) => {
  try {
    const messages = await Chat.find({
      $or: [
        { sender: req.user._id, receiver: req.params.receiverId },
        { sender: req.params.receiverId, receiver: req.user._id },
      ],
    }).populate("sender receiver", "name email");

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
