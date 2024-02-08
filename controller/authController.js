const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const { ACCESS_TOKEN_SECRET } = require("../util/var");

const loginAuth = async (req, res) => {
  const { email, password } = req.body;

  //   const hashpass = await bcrypt.hash("admindada123", 10);

  //   await User.create({
  //     email: "dada@gmail.com",
  //     password: hashpass,
  //     isAdmin: true,
  //   });

  try {
    if (!email || !password) {
      res.status(404).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const foundUser = await User.findOne({ email: email }).exec();
    if (!foundUser) {
      return res.status(404).json({
        success: false,
        message: "Email doesn't match",
      });
    }

    const match = await bcrypt.compare(password, foundUser.password);

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Password doesn't match",
      });
    }

    const userData = {
      email: foundUser.email,
    };

    const access_token = jwt.sign(userData, ACCESS_TOKEN_SECRET, {
      expiresIn: "7d",
    });

    foundUser.access_token = access_token;
    await foundUser.save();

    return res.status(200).json({
      success: true,
      data: { access_token: access_token },
      message: "Login successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Can't login right now, Please contract admin ${error.message}`,
    });
  }
};

const authenticateAuth = async (req, res) => {
  res
    .status(200)
    .json({ success: true, message: "Welcome to the protected route!" });
};

module.exports = {
  loginAuth,
  authenticateAuth,
};
