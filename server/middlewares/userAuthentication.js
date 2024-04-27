// middlewares/userAuthentication.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const tokenController = require("../controllers/tokenController");
const User = require("../models/userModel");

// Authentication for hashing passwords

const hashPassword = async (plaintextPassword) => {
  const saltRounds = 10;
  return bcrypt.hash(plaintextPassword, saltRounds);
};

const comparePasswords = async (plaintextPassword, hashedPassword) => {
  return bcrypt.compare(plaintextPassword, hashedPassword);
};

const authenticateUser = async (req, res, next) => {
  const accessTokenExpired = tokenController.checkAccessTokenExpire(req);
  if (accessTokenExpired) {
    const user_id = parseInt(req.params.user_id);
    // Fetch the user from the database based on the email
    const user = await User.findOne({ where: { user_id: user_id } });

    if (!user) {
      return res
        .status(401)
        .json({ message: "User with this email does not exist" });
    }

    // Access Token
    JWTuser = { user_id: user.user_id, user_email: user.email };

    const accessToken = await tokenController.generateAccessToken(JWTuser);
    console.log("Access token has expired");

    res.cookie("accessToken", accessToken, {
      maxAge: 900000, // 15 minutes
      secure: true, // set to true if you're using https
      httpOnly: true,
      sameSite: "strict",
    });

    next();
  }

  // Validate JWT
  console.log("Starting authenticateUser");
  const token = req.headers.cookie?.split("accessToken=")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: Missing token" });
  }

  console.log(token);

  jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
    if (error) {
      return res.status(403).json({ error: "Unauthorized: Invalid token" });
    }

    req.user_id = decoded.userId;

    // move onto the userController
    next();
  });
};

module.exports = {
  hashPassword,
  comparePasswords,
  authenticateUser,
};
