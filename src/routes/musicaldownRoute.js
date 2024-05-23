const express = require("express");
const musicaldownController = require("../controllers/musicaldownController");

const router = express.Router();

router.get("/", musicaldownController.download);

module.exports = router;
