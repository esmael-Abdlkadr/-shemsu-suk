const jwt = require("jsonwebtoken");
// middleware to handle authentication errors
const catchAsync = require("./catchAsync");
const AppError = require("../utils/appError");
const User = require("../models/userModel");
const { promisify } = require("util");
const { JWT_SECRET } = require("../config");
const signToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: "90d" });
};
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.cookie("jwt", token, {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false,
  });
  // remove password from output
  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};
