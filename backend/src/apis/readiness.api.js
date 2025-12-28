const { ReadinessService } = require("../services");

exports.getReadinessDashboardStats = async (req, res) => {
    try {
        const readiness = await ReadinessService.computeReadinessMetrics();
        res.json(readiness);
    } catch (err) {
        console.error("[Readiness API] Error:", err);
        res.status(500).json({ error: "Failed to compute readiness." });
    }
};
