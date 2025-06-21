const User = require("../models/userModel");
const Ticket = require("../models/ticketModel");
const Note = require("../models/noteModel"); // Import the Note Model

// @desc    Get notes for a ticket
// @route   GET /api/tickets/:ticketId/notes
// @access  Private
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

    // NoteModel.findByTicketId now handles joining with Users to get userName
    const notes = await Note.findByTicketId(req.params.ticketId);

    res.status(200).json(notes);
  } catch (error) {
    console.error("Error getting notes:", error);
    return next(error);
  }
};

// @desc    Create a new note for a ticket
// @route   POST /api/tickets/:ticketId/notes
// @access  Private
const addNote = async (req, res, next) => {
  const { text } = req.body;

  if (!text) {
    res.status(400);
    return next(new Error("Please add some text for the note"));
  }

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
      return next(new Error("User not authorized to add notes to this ticket"));
    }

    const isStaff = req.user.role === "admin";

    // Pass the user's name from req.user to the Note.create function
    const note = await Note.create({
      ticketId: req.params.ticketId,
      userId: req.user.id,
      userName: user.name, // Pass the user's name here
      text,
      isStaff,
    });

    res.status(201).json(note);
  } catch (error) {
    console.error("Error adding note:", error);
    return next(error);
  }
};

// @desc    Reopen a ticket and add a note
// @route   PUT /api/tickets/:ticketId/reopen
// @access  Private (Admin or Ticket Owner)
const reopenTicket = async (req, res, next) => {
  const { reopenReason } = req.body;

  if (!reopenReason || reopenReason.trim() === "") {
    res.status(400);
    return next(new Error("Please provide a reason for reopening the ticket."));
  }

  try {
    const user = await User.findById(req.user.id);
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
      ticket.userId.toString() !== req.user.id.toString() &&
      req.user.role !== "admin"
    ) {
      res.status(401);
      return next(new Error("User not authorized to reopen this ticket"));
    }

    if (
      ticket.status === "open" ||
      ticket.status === "new" ||
      ticket.status === "reopened"
    ) {
      res.status(400);
      return next(
        new Error(
          "Ticket cannot be reopened as it is already open, new, or already reopened."
        )
      );
    }

    const updatedTicket = await Ticket.update(req.params.id, {
      status: "reopened",
    });

    if (!updatedTicket) {
      res.status(500);
      return next(new Error("Failed to update ticket status to reopened."));
    }

    const isStaff = req.user.role === "admin";
    const reopeningNoteText = `Ticket reopened by ${user.name} (${
      isStaff ? "Staff" : "User"
    }) with reason: "${reopenReason}"`;

    // Pass the user's name from req.user to the Note.create function
    const newNote = await Note.create({
      ticketId: req.params.id,
      userId: req.user.id,
      userName: user.name, // Pass the user's name here
      text: reopeningNoteText,
      isStaff: isStaff,
    });

    res.status(200).json({
      ticket: updatedTicket,
      note: newNote,
      message: "Ticket successfully reopened and note added.",
    });
  } catch (error) {
    console.error("Error reopening ticket:", error);
    return next(error);
  }
};

module.exports = {
  getNotes,
  addNote,
  reopenTicket,
};
