const AppError = require("./src/utils/appError");
const userRouter = require("./src/Routes/userRoute");
const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const app = express();
// GLOBAL-MIDDLEWARE.
// set security of HTTP header.
app.use(helmet());
app.use(express.json());
if (process.env.NODE_ENV === "developement") {
  app.use(morgan("dev"));
}

// parse user cookie
app.use(cookieParser());

// Router.
app.use("/api/v1/users", userRouter);
app.all("*", (req, res, next) => {
  next(new AppError(`page not found ${req.originalUrl}`, 404));
});
// handlign error handler
app.use(AppError);

module.exports = app;
