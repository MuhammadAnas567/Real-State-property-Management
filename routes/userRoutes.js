const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getAllUsers } = require("../controllers/userController");
const { authMiddleware, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/all", authMiddleware, authorizeRoles("admin"), getAllUsers);

module.exports = router;
