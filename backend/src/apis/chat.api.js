const { ChatService } = require("../services");

const chatHandler = async (req, res) => {
    try {
        const { message } = req.body;

        const result = await ChatService.processChatMessage(message);

        res.json(result);
    } catch (err) {
        console.error("[chatHandler] Error:", err);
        res.status(500).json({ error: err.message || "Something went wrong." });
    }
};

module.exports = { chatHandler };

// Returns five suggested natural-language questions for the query editor
const samplesHandler = async (req, res) => {
    try {
        const samples = await ChatService.getQuestionSamples();
        res.json({ samples });
    } catch (err) {
        console.error("[samplesHandler] Error:", err);
        res.status(500).json({ error: err.message || "Failed to generate samples." });
    }
};

module.exports.samplesHandler = samplesHandler;
