const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// Import from ticketController
const {
  getTickets,
  createTicket,
  getTicket,
  updateTicket,
  deleteTicket,
  getAllTicketsForAdmin,
  getSingleTicketForAdmin,
  holdTicket,
  pendingTicket,
  resolveTicket,
  closeTicket,
  upload,
} = require("../controllers/ticketController");

// IMPORTANT: Import reopenTicket from noteController
const {
  getNotes,
  addNote,
  reopenTicket, // <--- IMPORT REOPEN TICKET FROM NOTE CONTROLLER HERE
} = require("../controllers/noteController");

// Regular Ticket Routes
router.get("/", protect, getTickets);
router.post("/", protect, upload.single("file"), createTicket);
router.get("/:id", protect, getTicket);
router.put("/:id", protect, upload.single("file"), updateTicket);
router.delete("/:id", protect, authorizeRoles(["admin"]), deleteTicket);

// Specific Status Update Routes (PATCH for partial updates)
router.patch("/:id/hold", protect, authorizeRoles(["admin"]), holdTicket);
router.patch("/:id/pending", protect, authorizeRoles(["admin"]), pendingTicket);
router.patch(
  "/:id/resolved",
  protect,
  authorizeRoles(["admin"]),
  resolveTicket
);
router.patch("/:id/close", protect, closeTicket);

// THIS IS THE CRITICAL LINE FOR THE REOPEN ENDPOINT
router.patch("/:id/reopen", protect, reopenTicket); // Removed console.log here

// Nested Note Routes for a Specific Ticket
router.get("/:ticketId/notes", protect, getNotes);
router.post("/:ticketId/notes", protect, addNote);

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
