const User = require("../models/userModel"); // User model still needed for some checks, but not for name lookup in note creation
const Ticket = require("../models/ticketModel");
const Note = require("../models/noteModel");

const getNotes = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(401);
      return next(new Error("User not found"));
    }
    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket) {
      res.status(404);
      return next(new Error("Ticket not found"));
    }
    if (
      ticket.userId.toString() !== req.user.id.toString() &&
      req.user.role !== "admin"
    ) {
      res.status(401);
      return next(
        new Error("User not authorized to view notes for this ticket")
      );
    }
    const notes = await Note.findByTicketId(req.params.ticketId);
    res.status(200).json(notes);
  } catch (error) {
    console.error("Error getting notes:", error);
    return next(error);
  }
};

const addNote = async (req, res, next) => {
  const { text } = req.body;
  if (!text) {
    res.status(400);
    return next(new Error("Please add some text for the note"));
  }
  try {
    const user = await User.findById(req.user.id); // Still need user for auth check here, but not specifically for userName
    if (!user) {
      res.status(401);
      return next(new Error("User not found"));
    }
    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket) {
      res.status(404);
      return next(new Error("Ticket not found"));
    }
    if (
      ticket.userId.toString() !== req.user.id.toString() &&
      req.user.role !== "admin"
    ) {
      res.status(401);
      return next(new Error("User not authorized to add notes to this ticket"));
    }
    const isStaff = req.user.role === "admin";
    const note = await Note.create({
      ticketId: req.params.ticketId,
      userId: req.user.id,
      userName: req.user.name, // Optimized: Use req.user.name directly
      text,
      isStaff,
    });
    res.status(201).json(note);
  } catch (error) {
    console.error("Error adding note:", error);
    return next(error);
  }
};

const reopenTicket = async (req, res, next) => {
  const { reopenReason } = req.body;
  if (!reopenReason || reopenReason.trim() === "") {
    res.status(400);
    return next(new Error("Please provide a reason for reopening the ticket."));
  }
  try {
    const user = await User.findById(req.user.id); // Still need user for auth check here
    if (!user) {
      res.status(401);
      return next(new Error("User not found"));
    }
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      res.status(404);
      return next(new Error("Ticket not found"));
    }
    if (
      req.user.role !== "admin" &&
      !(
        ticket.userId &&
        req.user.id &&
        ticket.userId.toString() === req.user.id.toString()
      )
    ) {
      res.status(403);
      return next(
        new Error(
          "Access forbidden. You are not authorized to reopen this ticket."
        )
      );
    }
    if (ticket.status !== "closed" && ticket.status !== "resolved") {
      res.status(400);
      return next(
        new Error(
          `Ticket cannot be reopened from status: ${ticket.status}. It must be closed or resolved.`
        )
      );
    }

    // Optimized: Use Ticket.updateStatus for consistency, passing the reason
    const updatedTicket = await Ticket.updateStatus(
      req.params.id,
      "reopened",
      reopenReason
    );

    if (!updatedTicket) {
      res.status(500);
      return next(new Error("Failed to update ticket status to reopened."));
    }
    const isStaff = req.user.role === "admin";
    const reopeningNoteText = `Ticket reopened by ${req.user.name} (${
      isStaff ? "Staff" : "User"
    }) with reason: "${reopenReason}"`;

    const newNote = await Note.create({
      ticketId: req.params.id,
      userId: req.user.id,
      userName: req.user.name, // Optimized: Use req.user.name directly
      text: reopeningNoteText,
      isStaff: isStaff,
    });
    res.status(200).json({
      ticket: updatedTicket,
      note: newNote,
      message: "Ticket successfully reopened and note added.",
    });
  } catch (error) {
    console.error("Error reopening ticket (NoteController):", error);
    return next(error);
  }
};

module.exports = {
  getNotes,
  addNote,
  reopenTicket,
};
