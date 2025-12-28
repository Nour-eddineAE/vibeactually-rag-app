const router = require("express").Router();
const { TaskAPI } = require("../apis");
const multer = require("multer");
const path = require("path");

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Save files to /uploads
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

// File filter: only accept Excel files
const fileFilter = (req, file, cb) => {
    const allowedTypes = [".xlsx", ".xls"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error("Only Excel files (.xlsx, .xls) are allowed"));
    }
};

const upload = multer({ storage, fileFilter });

router.post("/upload", upload.single("file"), TaskAPI.handleTasksUpload);
router.get("/test", TaskAPI.testApi);

module.exports = router;
