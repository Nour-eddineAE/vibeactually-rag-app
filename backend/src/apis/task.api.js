const { TaskData } = require("../data");
const { TaskService } = require("../services");

exports.handleTasksUpload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({ message: "No file uploaded or invalid file type." });
        }

        const summary = await TaskService.importTasksFromExcel(req.file.path);

        res.status(200).send({
            message: "File uploaded and processed successfully!",
            file: req.file.originalname,
            summary,
        });
    } catch (err) {
        console.error("[handleTasksUpload] Error:", err);
        res.status(500).send({ message: "Error processing uploaded file." });
    }
};

exports.testApi = async (req, res) => {
    try {
        const { members, tasks, teams } = await TaskData.getTestData();

        res.json({
            status: "ok",
            message: "Backend and database are working!",
            members: members.rows,
            tasks: tasks.rows,
            teams: teams.rows,
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: "Database connection failed",
            error: err.message,
        });
    }
};
