// controllers/userController.js
const RefreshToken = require("../models/refreshTokenModel");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// Check if refreshToken still exists
const getRefreshToken = async (user_id) => {
  // Check if the username is already in use
  console.log(user_id);
  const existingToken = await RefreshToken.findOne({
    where: { user_id: user_id },
  });

  return existingToken;
};

const createRefreshToken = (user_id) => {
  const refreshToken = jwt.sign(
    { user_id: user_id },
    process.env.REFRESH_JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );

  return refreshToken;
};

const newRefreshToken = async (req, res, next) => {
  const { email } = req.body;

  // Fetch the user from the database based on the email
  const user = await User.findOne({ where: { email: email } });

  if (!user) {
    return res
      .status(401)
      .json({ message: "User with this email does not exist" });
  }

  try {
    console.log("Creating new Refresh Token");
    const user_id = user.user_id;

    existingToken = await getRefreshToken(user_id);
    if (!existingToken) {
      // Token does not exist
      // Store new Refresh Token in database
      refreshToken = createRefreshToken(user_id);

      const newRefreshToken = new RefreshToken({
        user_id: user_id,
        token: refreshToken,
      });
      // Save the new Refresh Token
      await newRefreshToken.save();
    } else if (existingToken) {
      console.log("Refresh Token Exists");
    }
    next();
  } catch (error) {
    console.log(error);
    return res.json({ error: error });
  }
};

const deleteRefreshToken = async (req, res, next) => {
  try {
    const user_id = parseInt(req.body.user_id);
    if (!user_id) {
      res.json({ message: "No user id provided to log out user" });
    }

    const existingToken = await getRefreshToken(user_id);

    if (!existingToken) {
      // Token does not exist
      console.log("Token does not exist");
    }

    try {
      // Verify the access token if it is right and not expired

      const decodedToken = jwt.verify(
        existingToken.dataValues.token,
        process.env.REFRESH_JWT_SECRET
      );
      console.log("refreshtoken is correct and not expired");
    } catch (error) {
      console.log("Error verifying refreshtoken", error);
      return res.json({ error: error });
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
    next();
  } catch (error) {
    console.error("Error deleting refresh token:", error);
  }
};

// TODO: Make access tokens using refresh tokens, refresh tokens using user_id only, access tokens are made by using user_id obtained from refresh tokens
// Function to generate a new access token using a refresh token
const generateAccessToken = (user_id) => {
  try {
    // Generate a new access token using the extracted information
    const accessToken = jwt.sign({ userId: user_id }, process.env.JWT_SECRET, {
      expiresIn: "15m", // Set the expiration time for the access token
    });

    return accessToken;
  } catch (error) {
    console.log("Error generating access token:", error);
    return null;
  }
};

const verifyAccessToken = async (req, res) => {
  // TODO Make a new Access token if it has expired
  // Does it exist
  // Is it right
  // Did it expire

  console.log("Verify the Access Token");
  accessToken = req.headers.cookie?.split("accessToken=")[1];
  console.log(accessToken);

  if (!accessToken) {
    try {
      console.log("No access token provided");

      const { email } = req.body;

      // Fetch the user from the database based on the email
      const user = await User.findOne({ where: { email: email } });

      if (!user) {
        return res
          .status(401)
          .json({ message: "User with this email does not exist" });
      }

      refreshToken = await getRefreshToken(user.user_id);

      const decodedToken = jwt.verify(
        refreshToken.dataValues.token,
        process.env.REFRESH_JWT_SECRET
      );

      // Access token has expired
      const accessToken = generateAccessToken(decodedToken.user_id);

      res.cookie("accessToken", accessToken, {
        maxAge: 900000, // 15 minutes
        secure: true, // set to true if you're using https
        httpOnly: true,
        sameSite: "strict",
      });

      return res.json({
        message: "accessToken has been made",
        token: accessToken,
      });
    } catch (error) {
      console.log("Error verifying Refresh Token");

      // Either it expired or an error
      // Both should log out user
    }
  }

  try {
    // Verify the access token if it is right and not expired
    const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET);
    console.log("accessToken is correct and not expired");
    return res.json({ message: accessToken });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      console.log("Access token has expired");

      // Create a new accessToken
      const accessToken = generateAccessToken(decodedToken.user_id);

      res.cookie("accessToken", accessToken, {
        maxAge: 900000, // 15 minutes
        secure: true, // set to true if you're using https
        httpOnly: true,
        sameSite: "strict",
      });

      return res.json({ message: "accessToken has been made" });
    } else {
      console.log("Error verifying access token", error);
      return res.json({ error: error });
    }
  }
};

module.exports = {
  newRefreshToken,
  getRefreshToken,
  createRefreshToken,
  deleteRefreshToken,
  generateAccessToken,
  verifyAccessToken,
};
