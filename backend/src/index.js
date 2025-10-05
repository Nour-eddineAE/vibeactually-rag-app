require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const multer = require("multer");
const path = require("path");

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Save files to /uploads
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Append extension
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

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.connect()
    .then(() => console.log("✅ Connected to PostgreSQL"))
    .catch((err) => console.error("❌ DB connection error", err));

// Test route
app.get("/api/test", async (req, res) => {
    try {
        // Insert dummy member
        await pool.query(`
      INSERT INTO members (name)
      VALUES ('John Doe'), ('Jane Smith')
      ON CONFLICT DO NOTHING;
    `);

        // Insert dummy tasks
        await pool.query(`
      INSERT INTO tasks (member_id, name, due_date, overdue)
      VALUES
      (1, 'Task 1', CURRENT_DATE + INTERVAL '1 day', false),
      (1, 'Task 2', CURRENT_DATE - INTERVAL '1 day', true),
      (2, 'Task 3', CURRENT_DATE, false)
      ON CONFLICT DO NOTHING;
    `);

        // Fetch members and tasks
        const members = await pool.query("SELECT * FROM members");
        const tasks = await pool.query("SELECT * FROM tasks");

        res.json({
            status: "ok",
            message: "Backend and database are working!",
            members: members.rows,
            tasks: tasks.rows,
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: "Database connection failed",
            error: err.message,
        });
    }
});

app.post("/api/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: "No file uploaded or invalid file type." });
    }

    console.log("File uploaded:", req.file.path);

    res.status(200).send({
        message: "File uploaded successfully!",
        file: req.file.originalname,
    });
});

app.listen(4000, () => {
    console.log("🚀 Backend running on http://localhost:4000");
});
