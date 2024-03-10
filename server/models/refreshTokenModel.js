// models/refreshTokenModel.js

// Imports
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // Configure database connection

// RefreshToken Model
const RefreshToken = sequelize.define(
  "refreshToken",
  {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false, // Disable Sequelize's default timestamps (createdAt, updatedAt)
  }
);

module.exports = RefreshToken;
