const mongoose = require("mongoose");
const validator = require("validator");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { Schema } = mongoose;
const userSchema = Schema({
  name: {
    type: String,
    required: [true, "please eneter your name"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "please enter your email"],
    trim: true,
    unique: true,
    lowerCase: true,
    validate: [validator.isEmail, "please enter valid email address"],
  },
  role: {
    type: String,
    default: "user",
  },
  photo: String,
  password: {
    type: String,
    trim: true,
    required: [
      function () {
        // required the password if it is explicity  set.
        return this.isNew || this.isModified("password");
      },
      "please enter your password",
    ],
    minLength: [7, "please enter  character greater than 7"],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [
      function () {
        return this.isModified("password");
      },
      "please confirm your password",
    ],
    validate: {
      validator: function (el) {
        return !this.isNew || el === this.password;
      },
      message: "password doesn't match",
    },
  },
  passwordChangedAt: Date,
  passwordResetExpires: Date,
});
// pre-middleware  to hash password.
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
  } catch (err) {
    console.log(err);
    return next(err);
  }
});
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now();
  next();
});
// compare passwords.
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
// check password change.
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changeTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changeTimeStamp;
  }
  return false;
};
// create reset token.
userSchema.methods.PasswordResetTokenGenerator = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    //  generates a hexadecimal representation of the hash.
    .digest("hex");
  //   token expires in 30 min.
  this.passwordResetExpires = Date.now() + 30 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
