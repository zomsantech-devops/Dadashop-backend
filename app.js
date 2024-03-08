const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();

// import itemRoute from "./route";
// const userRoute = require("./route");
// --es-module-specifier-resolution=node
const { imageRoute } = require("./routes/imageRoute.js");
const { itemRoute } = require("./routes/itemRoute.js");
const { settingRoute } = require("./routes/settingRoute.js");
const { authRoute } = require("./routes/authRoute.js");
const { presetRoute } = require("./routes/presetRoute");
const { userBalanceRoute } = require("./routes/userBalanceRoute");

const { routeNotFound } = require("./middleware/routeNotFound.js");

const corsOptions = {
  origin: [
    "https://dadashop-frontend.vercel.app/",
    "http://localhost:3000/",
    "https://dadashop-frontend.vercel.app/item-shop/",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(bodyParser.json());

app.use(cors());

app.all("*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

app.use("/api/v1/auth", authRoute);

app.use("/api/v1/item", itemRoute);

app.use("/api/v1/image", imageRoute);

app.use("/api/v1/setting", settingRoute);

app.use("/api/v1/preset", presetRoute);

// app.use("/api/v1/currency", currencyRoute);

// <---- Dadashop legacy

app.use("/api/v1/user-balance", userBalanceRoute);

app.use(routeNotFound);

// Dadashop legacy ---->

// app.use("/api/v1/user", userRoute);

module.exports = app;
