// index.js

// IMPORTS //
const express = require("express");
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
const sequelize = require("./config/database");
const User = require("./models/userModel");
const userRoute = require("./routes/users");

// Load environment variables from .env file
require("dotenv").config();

// ROUTERS //

// const messageRoute = require("./routes/messages")
// const guestRoute = require("./routes/guests")

// app.use("/users", userRoute)

// ROUTES //

// Synchronize models with the database, only in development not production
sequelize.sync({ force: false }).then(() => {
  console.log("Database and tables synchronized");
});

router.use("/users", userRoute);

app.use(bodyParser.json());
app.use(router);

app.listen(process.env.PORT, () => {
  console.log("Server has started on port 1026");
});
