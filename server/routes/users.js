// Import necessary modules
const express = require("express");
const router = express.Router();

// Import user-related controllers and middleware ( For authentication)
const UserAuthentication = require("../middlewares/userAuthentication");
const UserController = require("../controllers/userController");

// Import token-related controllers and middleware
const tokenController = require("../controllers/tokenController");

// Route to register a new user
router.post("/register", UserController.registerUser);

// Route to login a user
router.post(
  "/login",
  UserController.loginUser,
  tokenController.newRefreshToken
);

// Route to logout a user
router.post(
  "/logout",
  UserAuthentication.authenticateUser,
  tokenController.verifyAccessToken,
  UserController.logoutUser
);

router.post(
  "/refresh_token",
  UserAuthentication.authenticateUser,
  tokenController.verifyAccessToken,
  tokenController.newRefreshToken
);

// Route to get all users
router.get("/", UserController.getAllUsers);

// Route to get a user
router.get(
  "/:user_id",
  UserAuthentication.authenticateUser,
  tokenController.verifyAccessToken,
  UserController.getUserById
);

// Route to update a user's profile
router.put(
  "/:user_id",
  UserAuthentication.authenticateUser,
  tokenController.verifyAccessToken,
  UserController.updateUser
);

// Route to delete a user
router.delete(
  "/:user_id",
  UserAuthentication.authenticateUser,
  tokenController.verifyAccessToken,
  UserController.deleteUser,
  tokenController.deleteRefreshToken
);

router.delete(
  "/refresh_token",
  UserAuthentication.authenticateUser,
  tokenController.verifyAccessToken,
  tokenController.deleteRefreshToken
);

module.exports = router;
