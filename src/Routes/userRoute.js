const userController = require("../controller/userController");
const authController = require("../controller/authController");
const express = require("express");
const router = express.Router();
router.route("/signup").post(authController.signUp);
router.route("/login").post(authController.login);
router
  .route("/")
  .post(userController.createUser)
  .get(userController.getAllUsers);
module.exports = router;
