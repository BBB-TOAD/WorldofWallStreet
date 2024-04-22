// controllers/userController.js
const userAuthentication = require("../middlewares/userAuthentication");
const User = require("../models/userModel");
const RefreshToken = require("../models/refreshTokenModel");
const jwt = require("jsonwebtoken");
// Check if refreshToken still exists
const checkRefreshToken = async (user_id) => {
  // Check if the username is already in use
  const existingToken = await RefreshToken.findOne({
    where: { user_id: user_id },
  });
  console.log(existingToken);
  return existingToken;
};

const createRefreshToken = async (req) => {
  const refreshToken = await jwt.sign(req, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  return refreshToken;
};

const saveRefreshToken = async (req, res) => {
  try {
    const refreshToken = await createRefreshToken(req);
    console.log(req.user_id, refreshToken);

    const newRefreshToken = new RefreshToken({
      user_id: req.user_id,
      token: refreshToken,
    });
    // Save the new Refresh Token
    const rest = await newRefreshToken.save();
    console.log(rest);
  } catch (error) {
    res.json({ error: error });
  }
};

const newRefreshToken = async (req, res) => {
  try {
    // Logic to generate new refresh token
    const refreshToken = req.body.refreshToken;
    const user_id = req.user_id;

    if (refreshToken == null)
      return res.status(401).json({ message: "no Refresh Token found" });

    existingToken = await checkRefreshToken(user_id, refreshToken);

    if (!existingToken) {
      // Token does not exist
      res.status(403).json({ message: "Token does not exist" });
    }

    jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET, (err, user) => {
      if (err)
        return send.status(403).json({ message: "JWT Verification Failed" });
      accessToken = generateAccessToken({
        user_id: user.user_id,
        user_email: user.email,
      });
      res.json({ accessToken: accessToken });
    });
  } catch (error) {
    console.error("Error generating refresh token:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getRefreshToken = async (req, res) => {
  try {
    // Retreive refresh token
    const result = await RefreshToken.findOne({
      where: { user_id: req },
    });
    return result.dataValues.token;
  } catch (error) {
    console.error("Error getting refresh token:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteRefreshToken = async (req) => {
  try {
    const user_id = req;

    const existingToken = await checkRefreshToken(user_id);
    const refreshToken = await getRefreshToken(user_id);

    if (!existingToken) {
      // Token does not exist
      res.status(403).json({ message: "Token does not exist" });
    }

    // Token exists
    // Delete Refresh Token
    RefreshToken.destroy({ where: { user_id: user_id } }).then(
      (rowsDeleted) => {
        if (rowsDeleted > 0) {
          console.log("Refresh Token deleted successfully.");
        } else {
          console.log("No matching record found for the given user_id");
        }
      }
    );
  } catch (error) {
    console.error("Error deleting refresh token:", error);
    // res.status(500).json({ error: "Internal Server Error" });
  }
};

// Make a JWT Access Token generator for refresh tokens
const generateAccessToken = async (JWTuser) => {
  return jwt.sign(JWTuser, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
};

const checkAccessTokenExpire = (req, res, next) => {
  const accessToken = req.headers.authorization?.split(" ")[1];
  // get the user's id
  const { user_id } = req.params;

  if (!accessToken) {
    return res
      .status(401)
      .json({ error: "Unauthorized: Missing access token" });
  }

  const secretKey = process.env.JWT_SECRET; // Replace with your actual secret key

  try {
    const decodedToken = jwt.verify(accessToken, secretKey);
    req.userId = decodedToken.sub; // Attach user ID to the request
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      newRefreshToken(user_id);
      return res.json({ message: "New Access Token created", accessToken });
    } else {
      return res
        .status(401)
        .json({ error: "Unauthorized: Invalid access token" });
    }
  }
};

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
      await saveRefreshToken({
        user_id: newUser.user_id,
        user_email: newUser.email,
      });

      res.json({ user: newUser, message: hashedPassword });
    }

    // res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const loginUser = async (req, res) => {
  try {
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

    // Access Token
    JWTuser = { user_id: user.user_id, user_email: user.email };

    const accessToken = await generateAccessToken(JWTuser);

    res.cookie("accessToken", accessToken, {
      maxAge: 900000, // 15 minutes
      secure: false, // set to true if you're using https
      httpOnly: true,
    });
    // Generate a JWT token for the authenticated user
    const refreshToken = await createRefreshToken(JWTuser);

    // Check if refresh token already exists
    const existingToken = await checkRefreshToken(user.user_id);

    if (!existingToken) {
      // Token does not exist
      // Store new Refresh Token in database
      const newRefreshToken = new RefreshToken({
        user_id: user.user_id,
        token: refreshToken,
      });
      // Save the new Refresh Token
      await newRefreshToken.save();
      res.status(200).json({
        message: "Authentication successful",
        accessToken,
        newRefreshToken,
      });
    } else if (existingToken) {
      // Token exists
      // Change Token Value
      RefreshToken.update(
        { token: refreshToken },
        { where: { user_id: user.user_id } }
      )
        .then((updatedRows) => {
          if (updatedRows > 0) {
            console.log("Refresh token updated successfully");
            res.json({
              message: "Refresh token updated successfully",
              refreshToken,
            });
          } else {
            console.log("No matching record found for the given user_id");
            res.json({
              message: "No matching record found for the given user_id",
            });
          }
        })
        .catch((error) => {
          console.error("Error updating refresh token:", error);
          res.json({
            message: "Error updating refresh token:",
            error,
          });
        });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const logoutUser = async (req, res) => {
  try {
    console.log("Starting logoutUser Controller");
    // Get email and password from req
    const { email, password } = req.body;

    // Fetch the user from the database based on the email
    const user = await User.findOne({ where: { email: email } });

    // Check if user exists
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

    // Check if entered password matchs with the stored hashed password
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    // Now delete session data and refresh token.

    // Set token to none and expire in 5 seconds
    res.cookie("accessToken", "none", {
      expires: new Date(Date.now() + 5 * 1000),
      httpOnly: true,
    });

    await deleteRefreshToken(user.user_id);

    res.status(200).json({ message: "User logged out succesfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllUsers = async (req, res) => {
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
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserById = async (req, res) => {
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

    // return the user
    res.status(200).json({ message: "Got user by id", user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateUser = async (req, res) => {
  try {
    // Get user_id
    const { user_id } = req.params;
    const { username, email, password } = req.body;

    // Find the user by ID
    const user = await User.findByPk(user_id);

    // If the user doesn't exist, return a 404 Not Found
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Hash the password before storing it
    const hashedPassword = await userAuthentication.hashPassword(password);

    // Update the user's information
    await user.update({
      username,
      email,
      hashedPassword,
    });

    res.status(200).json({ message: "User has been updated" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Logout -> deletes refresh token in database

module.exports = {
  newRefreshToken,
  getRefreshToken,
  checkAccessTokenExpire,
  registerUser,
  deleteRefreshToken,
  loginUser,
  logoutUser,
  getAllUsers,
  getUserById,
  updateUser,
};
