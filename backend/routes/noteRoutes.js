// backend/routes/noteRoutes.js
const express = require("express");
const router = express.Router({ mergeParams: true }); // Keep mergeParams: true here!
const protect = require("../middleware/authMiddleware");

// Only import note-specific controllers
const { getNotes, addNote } = require("../controllers/noteController");

router.get("/", protect, getNotes);
router.post("/", protect, addNote);

// *** MAKE SURE THIS LINE IS ABSENT: ***
// router.put("/reopen", protect, reopenTicket); // This should be REMOVED

module.exports = router;
