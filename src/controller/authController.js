const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const AppError = require("../utils/appError");
const User = require("../Model/userModel");
const catchAsync = require("../middleware/catchAsync");
const sendEmail = require("../utils/email");
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // Set cookie options
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
    ),
    // Restrict cookies from being saved on the client side (prevent XSS)
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") {
    cookieOptions.secure = true;
  }

  // Create and send the JWT cookie
  res.cookie("jwt", token, cookieOptions);

  // Remove the password from the user object before sending it to the client
  user.password = undefined;

  // Send the response with the JWT token and user data
  res.status(statusCode).json({ status: "success", token, data: { user } });
};

const validateRole = (role) => {
  const allowedRoles = ["user", "admin", "seller"];
  if (!allowedRoles.includes(role)) {
    throw new Error("Invalid role");
  }
};

// SIGNUP
exports.signUp = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, role } = req.body;

  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    role,
  });

  // Validate the user's role
  validateRole(role);

  // Create and send the JWT token in a cookie
  createSendToken(newUser, 201, res);
});

// 2. LOGIN
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. Check if the email and password are provided.
  if (!email || !password) {
    return next(
      new AppError("Please provide an email and password to login", 400)
    );
  }

  // 2. Find the user by email.
  const user = await User.findOne({ email }).select("+password");

  // 3. Check if the user exists and the password is correct.
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Email or password is incorrect", 400));
  }

  // Successful login, send the JWT token.
  createSendToken(user, 200, res);
});
// FORGOT-PASSWORD.
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1. Get the user based on the email address.
  const { email } = req.body;
  const user = await User.findOne({ email });
  //   2.if no user found return 404
  if (!user) {
    return next(
      new AppError(
        "No user is foudn with  the provided email, plese try with valid email",
        404
      )
    );
  }
  //   3.generate random token.
  const resetToken = user.PasswordResetTokenGenerator();
  //   4. deactivate validation before  saving.
  await user.save({ validateBeforeSave: false });
  //   5. construct password reset url.
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/reserPassword/${resetToken}`;
  //   6.compose the email.
  const subject = "Password Reset Request";
  const message =
    `Dear ${user.name},\n\n` +
    "We received a request to reset your password. If this wasn't you, please ignore this message.\n\n" +
    `To reset your password, click the following link (valid for 10 minutes):\n${resetURL}`;
});
