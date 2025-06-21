// backend/routes/ticketRoutes.js
const express = require("express");
const router = express.Router(); // IMPORTANT: This router should NOT have { mergeParams: true }
const protect = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// Import the note routes for nesting
const noteRoutes = require("./noteRoutes");

// Import the reopenTicket controller directly from noteController
// THIS IS CRUCIAL: Make sure reopenTicket is imported correctly.
const { reopenTicket } = require("../controllers/noteController");

// Import your ticket controller functions
const {
  getTickets,
  createTicket,
  getTicket,
  updateTicket,
  deleteTicket,
  getAllTicketsForAdmin,
  getSingleTicketForAdmin,
  upload,
} = require("../controllers/ticketController");


// Regular Ticket Routes
router.get("/", protect, getTickets);
router.post("/", protect, upload.single("file"), createTicket);
router.get("/:id", protect, getTicket);
router.put("/:id", protect, upload.single("file"), updateTicket);
router.delete("/:id", protect, authorizeRoles(["admin"]), deleteTicket);


// *** THIS IS THE CRITICAL LINE FOR THE REOPEN ENDPOINT ***
// It must be a PUT request to /:id/reopen relative to the base ticket route.
router.put("/:id/reopen", protect, reopenTicket);


// Nested Note Routes for a Specific Ticket
// All routes defined in noteRoutes will be prefixed with /api/tickets/:ticketId/notes
router.use("/:ticketId/notes", noteRoutes);


// Admin-specific Ticket Routes
router.get(
  "/admin/allTickets",
  protect,
  authorizeRoles(["admin"]),
  getAllTicketsForAdmin
);

router.get(
  "/admin/:id",
  protect,
  authorizeRoles(["admin"]),
  getSingleTicketForAdmin
);


module.exports = router;