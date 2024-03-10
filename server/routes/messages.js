// messages.js

// File for message routers
// There is only a public messaging chat, therefore no authentication is required

// Import necessary modules
const express = require("express");
const router = express.Router();

// Import user-related controllers and middleware ( For authentication)
const MessageController = require("../controllers/messagesController");

// Route to create a new message
router.post("/", MessageController.createMessage);

// Route to get all messages
router.get("/", MessageController.getAllMessages);

// Route to get a user
router.get("/:message_id", MessageController.getMessageById);

// Route to update a user's profile
router.put("/:message_id", MessageController.updateMessage);

// Route to delete a user
router.delete("/message_id", MessageController.deleteMessage);

module.exports = router;
