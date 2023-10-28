const AppError = require("../utils/appError");
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  err.message = err.message || "internal server error";
  // wrong mongodb id.
  if ((err.name = "castError")) {
    const message = "resource not found with this ID";
    err = new AppError(message, 404);
  }
  //   duplicate key error
  if (err.code === 11000) {
    const message = "duplicate field value";

    err = new AppError(message, 400);
  }
  //  jwt error.
  if (err.name === "JsonWebTokenError") {
    const message = "invalid token please login again";
    err = new AppError(message, 401);
  }
  //   jwt expired error.
  if (err.name === "TokenExpiredError") {
    const message = "token expired please login again";
    err = new AppError(message, 401);
  }
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};
