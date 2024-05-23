const express = require("express");
const tikwmController = require("../controllers/tikwmController");

const router = express.Router();

router.get("/", tikwmController.download);

module.exports = router;
