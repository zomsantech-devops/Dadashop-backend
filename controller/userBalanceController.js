const UserBalance = require("../models/userBalance");

const getAllUser = async (req, res) => {
  try {
    const userBalance = await UserBalance.find();
    res.json(userBalance);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

const createuser = async (req, res) => {
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
};

const getSingleUser = async (req, res) => {
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
};

const updateSingleUser = async (req, res) => {
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
};

module.exports = {
  getAllUser,
  getSingleUser,
  updateSingleUser,
  createuser,
};
