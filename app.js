const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();

const multer = require("multer");
const Image = require("./models/Image");

// import itemRoute from "./route";
// const userRoute = require("./route");
// --es-module-specifier-resolution=node
const { getImage } = require("./controller/imageController.js");
const { imageRoute } = require("./routes/imageRoute.js");

app.use(bodyParser.json());
app.use(cors());

// app.use("/api/v1/item", itemRoute);

app.use("/api/v1/image", imageRoute);

// app.use("/api/v1/user", userRoute);

module.exports = app;
