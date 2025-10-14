const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const connectDB = require("./config/db");

const userRoutes = require("./routes/userRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

const chatRoutes = require("./routes/chatRoutes");

const socketHandler = require("./socket");

dotenv.config();
// Cron Jobs
require("./cronjob");


connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/chats", chatRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("API is running...");
});

const server = http.createServer(app);

const io = socketIo(server, {
  cors: { origin: "*" },
});

socketHandler(io);


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
