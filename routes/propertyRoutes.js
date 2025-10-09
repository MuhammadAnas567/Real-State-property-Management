const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  createProperty,
  getAllProperties,
  updateProperty,
  deleteProperty,
} = require("../controllers/propertyController");
const { authMiddleware, authorizeRoles } = require("../middleware/authMiddleware");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, "uploads/images/");
    else if (file.mimetype.startsWith("video/")) cb(null, "uploads/videos/");
    else cb({ message: "Unsupported file type" }, false);
  },
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

router.post(
  "/",
  authMiddleware,
  authorizeRoles("admin"),
  upload.fields([{ name: "images", maxCount: 20 }, { name: "videos", maxCount: 5 }]),
  createProperty
);

router.get("/", authMiddleware, getAllProperties);
router.put("/:id", authMiddleware, updateProperty);
router.delete("/:id", authMiddleware, deleteProperty);

module.exports = router;
