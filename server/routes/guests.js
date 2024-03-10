// guests.js

// Import necessary modules
const express = require("express");
const router = express.Router();

// Import guest-related controllers
const GuestController = require("../controllers/guestController");

// Route to create a new guest
router.post("/", GuestController.createGuest);

// Route to get all guests
router.get("/", GuestController.getAllGuests);

// Route to get a guest
router.get("/:guest_id", GuestController.getGuestById);

// Route to update a guest's profile
router.put(
  "/:guest_id",
  GuestController.updateGuest
);

// Route to delete a guest
router.delete(
  "/guest_id",
  GuestController.deleteGuest
);

module.exports = router;
