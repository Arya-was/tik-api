const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const musicaldownRoutes = require("./routes/musicaldownRoute");
const ssstikRoutes = require("./routes/ssstikRoute");
const tikwmRoutes = require("./routes/tikwmRoute");

const app = express();

app.set("trust proxy", true);

app.set("json spaces", 2);
app.set("x-powered-by", false);

app.use("/api/musicalydown", musicaldownRoutes);
app.use("/api/ssstik", ssstikRoutes);
app.use("/api/tikwm", tikwmRoutes);

// middlewares
app.use(cors());
app.use(morgan("combined"));

module.exports = app;
