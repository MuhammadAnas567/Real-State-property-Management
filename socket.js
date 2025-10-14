const Chat = require("./models/Chat");

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join", (userId) => {
      socket.userId = userId;
      console.log(`User ${userId} joined`);
    });

    socket.on("sendMessage", async (data) => {
      const { sender, receiver, message } = data;

      const newMessage = await Chat.create({ sender, receiver, message });

      io.emit("receiveMessage", newMessage);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.userId);
    });
  });
};

module.exports = socketHandler;
