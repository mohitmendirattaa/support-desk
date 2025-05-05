const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const Ticket = require("../models/ticketModel");
const protect = require("../middleware/authMiddleware");
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

// router.get("/:id", protect, async (req, res) => {
//   console.log(req.params.id);
//   const user = await User.findById(req.user.id);
//   if (!user) {
//     res.status(401);
//     throw new Error("User not found");
//   }
//   const ticket = await Ticket.findById(req.params.id);
// });

module.exports = router;
