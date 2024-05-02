// controllers/userController.js
const userAuthentication = require("../middlewares/userAuthentication");
const User = require("../models/userModel");
const RefreshToken = require("../models/refreshTokenModel");
const tokenController = require("./tokenController");

// Check if refreshToken still exists

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if email already exists
    const checkEmail = async () => {
      // Check if the username is already in use
      const existingUser = await User.findOne({ where: { email: email } });

      return existingUser;
    };

    existingUser = await checkEmail();

    if (existingUser) {
      // User with the specified email exists
      res.status(409).json({ message: "Username already exists" });
    } else {
      // Hash the password before storing it
      const hashedPassword = await userAuthentication.hashPassword(password);

      // Create a new user
      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        user_type: "registered",
      });

      // Save the new User
      await newUser.save();

      res.json({ user: newUser });
    }

    // res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const loginUser = async (req, res, next) => {
  try {
    console.log("Logging in User");
    const { email, password } = req.body;

    // Fetch the user from the database based on the email
    const user = await User.findOne({ where: { email: email } });

    if (!user) {
      return res
        .status(401)
        .json({ message: "User with this email does not exist" });
    }

    // Compare the entered password with the stored hashed password
    const isPasswordValid = await userAuthentication.comparePasswords(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Authentication failed" });
    }
    console.log("Done Logging in User");
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const logoutUser = async (req, res) => {
  try {
    console.log("Starting logoutUser Controller");
    const user_id = req.body.user_id;

    // Get email and password from req

    // Fetch the user from the database based on the email
    const user = await User.findOne({ where: { user_id: user_id } });

    // Check if user exists
    if (!user) {
      return res
        .status(401)
        .json({ message: "User with this email does not exist" });
    }

    // Now delete session data and refresh token.

    // Set token to none and expire
    res.cookie("accessToken", "", {
      expires: new Date(0),
      httpOnly: true,
      secure: true, // Set to true if served over HTTPS
      sameSite: "strict", // Set to 'strict' for added security
    });

    res.status(200).json({ message: "User logged out succesfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      // Specify fields to search for
      // So that it doesn't give passwords
      attributes: ["user_id", "username", "email"],
    });

    if (!users) {
      return res.status(404).json({ message: "There are no users" });
    }

    res.status(200).json({ message: "Got all users", users });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserById = async (req, res, next) => {
  try {
    // get the user's id
    const { user_id } = req.params;

    // find the user in the db
    const user = await User.findOne({
      where: { user_id: user_id },
      attributes: ["user_id", "username", "email"],
    });

    // if there is no user, return error
    if (!user) {
      return res.status(404).json({ message: "There is no user with this id" });
    }

    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateUser = async (req, res) => {
  try {
    // Get user_id

    const user_id = parseInt(req.params.user_id);
    const { username, email, password } = req.body;
    console.log(req.params.user_id);

    // Find the user by ID
    const user = await User.findByPk(user_id);

    // If the user doesn't exist, return a 404 Not Found
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Hash the password before storing it
    const hashedPassword = await userAuthentication.hashPassword(password);

    const affectedRows = await User.update(
      {
        username: username,
        email: email,
        password: hashedPassword,
      },
      {
        where: { user_id: user_id },
      }
    );

    res.status(200).json({ message: "User has been updated" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    // Get user_id
    console.log("Delete User");
    const user_id = req.params.user_id;
    console.log(req.params.user_id);

    // Find the user by ID
    const user = await User.findByPk(user_id);

    // If the user doesn't exist, return a 404 Not Found
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await user.destroy();

    res.status(200).json({ message: "User has been deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Logout -> deletes refresh token in database

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
