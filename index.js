require('dotenv').config();

const express = require("express");
const cors = require("cors");
const app = express();
const router = express.Router();
const PORT = process.env.PORT || 5001;
const bodyParser = require("body-parser");
const password = process.env.MONGODB_PASSWORD;

app.use(cors());
app.use(bodyParser.json());
app.use('/api', router); 

const mongoose = require("mongoose");
mongoose.connect(`mongodb+srv://dadaShop:${password}@dadausers.adhegok.mongodb.net/dadaUsers`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

const UserBalance = require("./models/userBalance");

app.get("/dadaUsers/user_balance", async (req, res) => {
  console.log("Received request for userBalance");
  try {
    const userBalance = await UserBalance.find();
    res.json(userBalance);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

app.post("/dadaUsers/user_balance", async (req, res) => {
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

app.get("/dadaUsers/user_balance/:input", async (req, res) => {
  const userInput = req.params.input;
  try {
    let userBalance;
    if (userInput) {
      userBalance = await UserBalance.findOne({
        $or: [{ id: userInput }, { discord_id: userInput }, {name: userInput}, {name_display: userInput}, {discord_username: userInput}],
      });
    } else {
      return res.status(400).json({ message: 'Input parameter is required' });
    }
    if (!userBalance) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(userBalance);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

app.post("/dadaUsers/user_balance/:input", async (req, res) => {
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
      return res.status(400).json({ message: 'Input parameter is required' });
    }
    if (!userBalance) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(userBalance);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));