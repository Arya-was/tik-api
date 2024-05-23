const express = require("express");
const ssstikController = require("../controllers/ssstikController");

const router = express.Router();

router.get("/", ssstikController.download);

module.exports = router;
