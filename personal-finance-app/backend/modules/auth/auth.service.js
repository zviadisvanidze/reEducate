const { model } = require("mongoose");
const userModel = require("./auth.model");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.signUp = async ({ name, email, password }) => {
  const existingUser = await userModel.findOne({ email });
  if (existingUser) {
    return "ALREADY_EXISTS";
  }

  const user = await userModel.create({ name, email, password });

  return user;
};

exports.signIn = async ({ email, password }) => {
  const user = await userModel.findOne({ email });
  if (!user) {
    return "INVALID_CREDENTIALS";
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return "INVALID_CREDENTIALS";
  }

  const payLoad = {
    userId: user._id,
  };

  const accessToken = await jwt.sign(payLoad, process.env.JWT_SECRET || process.env.SESSION_SECRET, {
    expiresIn: "1h",
  });

  return accessToken;
};

exports.currentUser = async (userId) => {
  const existsUser = await userModel.findById(userId);
  return existsUser;
};

exports.logout = async () => true;
