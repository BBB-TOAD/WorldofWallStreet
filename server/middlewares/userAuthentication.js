// middlewares/userAuthentication.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Authentication for hashing passwords

const hashPassword = async (plaintextPassword) => {
  const saltRounds = 10;
  return bcrypt.hash(plaintextPassword, saltRounds);
};

const comparePasswords = async (plaintextPassword, hashedPassword) => {
  return bcrypt.compare(plaintextPassword, hashedPassword);
};

const authenticateUser = (req, res, next) => {
  // Validate JWT
  console.log("Starting authenticateUser");
  const token = req.headers.authorization.split(" ")[1];

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
