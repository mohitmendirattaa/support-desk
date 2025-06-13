const express = require("express");
const router = express.Router();
const User = require("../models/userModel"); // Assuming this is used indirectly via middleware
const Ticket = require("../models/ticketModel"); // Assuming this is used indirectly via controller
const protect = require("../middleware/authMiddleware"); // For user authentication
const { authorizeRoles } = require("../middleware/roleMiddleware"); // For role-based authorization
const noteRoutes = require("./noteRoutes"); // Assuming you have nested note routes

const {
  getTickets, // User: Get all their tickets
  createTicket, // User: Create new ticket
  getTicket, // User: Get single ticket (their own)
  updateTicket, // User/Admin: Update specific ticket
  deleteTicket, // User/Admin: Delete specific ticket
  getAllTicketsForAdmin, // Admin: Get all tickets from all users
  getSingleTicketForAdmin, // NEW: Admin: Get single ticket from any user
} = require("../controllers/ticketController"); // Import the new function

// User Routes (Protected)
router.get("/", protect, getTickets);
router.post("/", protect, createTicket);
router.get("/:id", protect, getTicket); // This is for users to get *their own* ticket
router.put("/:id", protect, updateTicket);
router.delete("/admin/:id", protect, authorizeRoles(["admin"]), deleteTicket);
router.get(
  "/admin/allTickets",
  protect,
  authorizeRoles(["admin"]),
  getAllTicketsForAdmin
);

// NEW ROUTE: Get a single ticket for admin (e.g., /api/tickets/admin/:id)
router.get(
  "/admin/:id",
  protect,
  authorizeRoles(["admin"]),
  getSingleTicketForAdmin
);

router.use("/:ticketId/notes", noteRoutes);

module.exports = router;
