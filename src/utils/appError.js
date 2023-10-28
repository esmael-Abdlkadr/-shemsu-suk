// write error handler class  for  statuscode start with 4 and 5
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    // statuscode start with 4 and 5
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";

    // capture the stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = AppError;
