const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const Ticket = require("../models/ticketModel");
const protect = require("../middleware/authMiddleware");
const noteRoutes = require("./noteRoutes");
const {
  getTickets,
  createTicket,
  getTicket,
  updateTicket,
  deleteTicket,
} = require("../controllers/ticketController");

router.get("/", protect, getTickets);
router.post("/", protect, createTicket);
router.get("/:id", protect, getTicket);
router.put("/:id", protect, updateTicket);
router.delete("/:id", protect, deleteTicket);

router.use("/:ticketId/notes", noteRoutes);

module.exports = router;
