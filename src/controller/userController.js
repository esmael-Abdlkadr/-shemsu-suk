const User = require("../Model/userModel");
const catchAsync = require("../middleware/catchAsync");
const AppError = require("../utils/appError");

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  if (!users || users.length === 0) {
    next(new AppError("their is no user", 404));
  }
  res.status(200).json({
    status: "sucess",
    result: users.length,
    data: { users: { users } },
  });
});
exports.createUser = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const userEmail = await User.findOne({ email });
  if (userEmail) {
    next(new AppError("user already exist", 404));
  }
  const newUser = await User.create(req.body);
  res.status(201).json({
    status: "sucess",
    data: { newUser },
  });
});
