const express = require("express");
const multer = require("multer");
const {
  createProperty,
  getAllProperties,
  updateProperty,
  deleteProperty,
} = require("../controllers/propertyController");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, "uploads/images/");
    } else if (file.mimetype.startsWith("video/")) {
      cb(null, "uploads/videos/");
    } else {
      cb({ message: "Unsupported file type" }, false);
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post(
  "/",
  upload.fields([
    { name: "images", maxCount: 20 },
    { name: "videos", maxCount: 5 },
  ]),
  createProperty
);

router.get("/", getAllProperties);
router.put("/:id", updateProperty);
router.delete("/:id", deleteProperty);

module.exports = router;
