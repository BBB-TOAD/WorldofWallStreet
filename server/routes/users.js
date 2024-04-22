// Import necessary modules
const express = require("express");
const router = express.Router();

// Import user-related controllers and middleware ( For authentication)
const UserAuthentication = require("../middlewares/userAuthentication");
const UserController = require("../controllers/userController");

// Route to register a new user
router.post(
  "/register",
  UserController.registerUser,
  UserController.newRefreshToken
);

// Route to login a user
router.post("/login", UserController.loginUser);

// Route to logout a user
router.post(
  "/logout",
  UserAuthentication.authenticateUser,
  UserController.logoutUser
);

router.post(
  "/refresh_token",
  UserAuthentication.authenticateUser,
  UserController.newRefreshToken
);

// Route to get all users
router.get("/", UserController.getAllUsers);

// Route to get a user
router.get("/:user_id", UserController.getUserById);

// Route to update a user's profile
router.put(
  "/:user_id",
  UserController.checkAccessTokenExpire,
  UserAuthentication.authenticateUser,
  UserController.updateUser
);

// // Route to delete a user
// router.delete(
//   "/user_id",
//   AuthMiddleware.authenticateUser,
//   UserController.deleteUser
// );

router.delete(
  "/refresh_token",
  UserAuthentication.authenticateUser,
  UserController.deleteRefreshToken
);

module.exports = router;
