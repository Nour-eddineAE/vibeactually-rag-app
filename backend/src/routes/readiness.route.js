// src/routes/readiness.routes.js
const express = require("express");
const { ReadinessAPI } = require("../apis");
const router = express.Router();

router.get("/", ReadinessAPI.getReadinessDashboardStats);

module.exports = router;
