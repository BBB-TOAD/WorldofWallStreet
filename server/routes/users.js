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
  tokenController.newRefreshToken,
  tokenController.verifyAccessToken
);

// Route to logout a user
router.post(
  "/logout",

  tokenController.deleteRefreshToken,
  UserController.logoutUser
);

// Route to get all users
router.get("/", UserController.getAllUsers, tokenController.verifyAccessToken);

// Route to get a user
router.get(
  "/:user_id",

  UserController.getUserById,
  tokenController.verifyAccessToken
);

// Route to update a user's profile
router.put(
  "/:user_id",

  UserController.updateUser,
  tokenController.verifyAccessToken
);

// Route to delete a user
router.delete(
  "/:user_id",
  tokenController.deleteRefreshToken,
  UserController.deleteUser
);

module.exports = router;
