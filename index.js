const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const propertyRoutes = require("./routes/propertyRoutes.js");
dotenv.config();
connectDB()

const app = express();
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/users", userRoutes);
app.use("/api/properties", propertyRoutes);

const PORT = process.env.PORT || 5000;
app.listen(process.env.PORT, () => {
    console.log(`server running at port ${PORT}`);
})