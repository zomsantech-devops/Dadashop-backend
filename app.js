const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();

// import itemRoute from "./route";
// const userRoute = require("./route");
// --es-module-specifier-resolution=node
const { getImage } = require("./controller/imageController.js");
const { imageRoute } = require("./routes/imageRoute.js");
const { itemRoute } = require("./routes/itemRoute.js");
const { settingRoute } = require("./routes/settingRoute.js");
const { authRoute } = require("./routes/authRoute.js");

const { routeNotFound } = require("./middleware/routeNotFound.js");

const UserBalance = require("./models/userBalance");
const { verifyAccessToken } = require("./middleware/verifyAccessToken.js");

app.use(bodyParser.json());
app.use(cors());

app.use("/api/v1/auth", authRoute);

app.use("/api/v1/item", itemRoute);

app.use("/api/v1/image", imageRoute);

app.use("/api/v1/setting", settingRoute);

// <---- Dadashop legacy

app.get("api/dadaUsers/user_balance", async (req, res) => {
  console.log("Received request for userBalance");
  try {
    const userBalance = await UserBalance.find();
    res.json(userBalance);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

app.post("api/dadaUsers/user_balance", async (req, res) => {
  const {
    id,
    discord_id,
    discord_username,
    name,
    name_display,
    current_points,
    total_points,
    tier,
  } = req.body;

  try {
    const newUserBalance = new UserBalance({
      id,
      discord_id,
      discord_username,
      name,
      name_display,
      current_points,
      total_points,
      tier,
    });

    const savedUserBalance = await newUserBalance.save();

    res.json(savedUserBalance);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

app.get("api/dadaUsers/user_balance/:input", async (req, res) => {
  const userInput = req.params.input;
  try {
    let userBalance;
    if (userInput) {
      userBalance = await UserBalance.findOne({
        $or: [
          { id: userInput },
          { discord_id: userInput },
          { name: userInput },
          { name_display: userInput },
          { discord_username: userInput },
        ],
      });
    } else {
      return res.status(400).json({ message: "Input parameter is required" });
    }
    if (!userBalance) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(userBalance);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

app.post("api/dadaUsers/user_balance/:input", async (req, res) => {
  const userInput = req.params.input;
  const {
    discord_id,
    discord_username,
    name,
    name_display,
    current_points,
    total_points,
    tier,
  } = req.body;

  try {
    let userBalance;
    if (userInput) {
      userBalance = await UserBalance.findOneAndUpdate(
        { $or: [{ id: userInput }, { discord_id: userInput }] },
        {
          discord_id,
          discord_username,
          name,
          name_display,
          current_points,
          total_points,
          tier,
        },
        { new: true }
      );
    } else {
      return res.status(400).json({ message: "Input parameter is required" });
    }
    if (!userBalance) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(userBalance);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// app.use((req, res, next) => {
//   res.status(404).json({ message: "Route Not Found" });
// });
// app.get("/api/v1/auth/protected", verifyAccessToken, (req, res) => {
//   res.json({ message: "Welcome to the protected route!" });
// });

app.use(routeNotFound);

// Dadashop legacy ---->

// app.use("/api/v1/user", userRoute);

module.exports = app;
