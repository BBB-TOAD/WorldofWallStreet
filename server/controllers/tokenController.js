// controllers/userController.js
const RefreshToken = require("../models/refreshTokenModel");
const jwt = require("jsonwebtoken");

// Check if refreshToken still exists
const checkRefreshToken = async (user_id) => {
  // Check if the username is already in use
  const existingToken = await RefreshToken.findOne({
    where: { user_id: user_id },
  });
  return existingToken;
};

const createRefreshToken = async (req) => {
  const refreshToken = await jwt.sign(req, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  return refreshToken;
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

const deleteRefreshToken = async (req, res) => {
  try {
    const user_id = req;

    const existingToken = await checkRefreshToken(user_id);

    if (!existingToken) {
      // Token does not exist
      console.log("Token does not exist");
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
  }
};
// TODO: Make access tokens using refresh tokens, refresh tokens using user_id only, access tokens are made by using user_id obtained from refresh tokens
// Function to generate a new access token using a refresh token
const generateAccessToken = (refreshToken) => {
  try {
    // Verify the refresh token and extract necessary information
    const decodedToken = jwt.verify(
      refreshToken,
      process.env.REFRESH_JWT_SECRET
    );

    // Generate a new access token using the extracted information
    const accessToken = jwt.sign(
      { userId: decodedToken.userId },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m", // Set the expiration time for the access token
      }
    );

    return accessToken;
  } catch (error) {
    console.log("Error generating access token:", error);
    return null;
  }
};

const checkAccessTokenExpire = (req) => {
  console.log("Check Access Token Expire");
  const accessToken = req.headers.cookie?.split("accessToken=")[1];

  if (!accessToken) {
    console.log("No access token provided");
    return true; // Assuming no token means expired
  }

  try {
    const decodedToken = jwt.decode(accessToken);
    if (!decodedToken || !decodedToken.exp) {
      console.log("Invalid access token");
      return true;
    }

    // Get current time in seconds
    const currentTime = Math.floor(Date.now() / 1000);

    // Check if token expiration time is in the past
    if (decodedToken.exp < currentTime) {
      console.log("Access token has expired");
      return true;
    }

    // Token is not expired
    return false;
  } catch (error) {
    console.log("Error decoding access token", error);
    return true; // Treat decoding errors as expired token
  }
};

const verifyAccessToken = async (req, res, next) => {
  // TODO Make a new Access token if it has expired
  console.log("Verify the Access Token");
  const accessToken = req.headers.cookie?.split("accessToken=")[1];

  if (!accessToken) {
    console.log("No access token provided");
    return res.json({ message: "No access token provided" });
  }
  secretKey = process.env.JWT_SECRET;
  try {
    const decodedToken = jwt.verify(accessToken, secretKey);
    next();
  } catch (error) {
    console.log("Error verifying access token", error);
    return res.json({ error: error });
  }
};

const newAccessToken = async (req, res, next) => {
  const accessToken = tokenController.generateAccessToken(JWTuser);

  res.cookie("accessToken", accessToken, {
    maxAge: 900000, // 15 minutes
    secure: true, // set to true if you're using https
    httpOnly: true,
    sameSite: "strict",
  });
};

module.exports = {
  newRefreshToken,
  getRefreshToken,
  checkAccessTokenExpire,
  createRefreshToken,
  checkRefreshToken,
  generateAccessToken,
  deleteRefreshToken,
  verifyAccessToken,
  newAccessToken,
};
