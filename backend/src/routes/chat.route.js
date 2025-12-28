const router = require("express").Router();
const { ChatAPI } = require("../apis");

router.post("/", ChatAPI.chatHandler);
router.get("/samples", ChatAPI.samplesHandler);

module.exports = router;
