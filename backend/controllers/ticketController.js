const User = require("../models/userModel");
const Ticket = require("../models/ticketModel");
const { v4: uuidv4 } = require("uuid");

const getTickets = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(401);
    throw new Error("User not found");
  }

  const tickets = await Ticket.find({
    user: req.user.id,
  });

  res.status(200).json(tickets);
};

const createTicket = async (req, res) => {
  const {
    description,
    priority,
    subCategory,
    startDate,
    endDate,
    service,
    category,
  } = req.body;

  if (
    !description ||
    !priority ||
    !subCategory ||
    !startDate ||
    !endDate ||
    !service ||
    !category
  ) {
    res.status(400);
    throw new Error("Please add all required fields");
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(401);
    throw new Error("User not found");
  }

  try {
    let ticketId;
    const uniqueNumericPart = Math.floor(
      10000000 + Math.random() * 90000000
    ).toString();

    // --- DEBUGGING LOGS ---
    console.log("DEBUG: Received service type from frontend:", service);
    // --- END DEBUGGING LOGS ---

    if (service === "Service") {
      // This should match the value from your frontend's <option value="Service">
      ticketId = `SR${uniqueNumericPart}`;
    } else if (service === "Incident") {
      // This should match the value from your frontend's <option value="Incident">
      ticketId = `IN${uniqueNumericPart}`;
    } else {
      // Fallback for unexpected service types, should ideally not be hit if frontend values are consistent
      ticketId = `GEN${uniqueNumericPart}`;
      console.warn(
        `Unexpected service type: "${service}". Generated generic ID: ${ticketId}`
      );
    }

    // --- DEBUGGING LOGS ---
    console.log("DEBUG: Generated ticketId before Mongoose create:", ticketId);
    // --- END DEBUGGING LOGS ---

    const ticket = await Ticket.create({
      _id: ticketId, // Ensure ticketId is a non-empty string here
      priority,
      subCategory,
      description,
      user: req.user.id,
      status: "new",
      startDate,
      endDate,
      service,
      category,
    });

    res.status(201).json(ticket);
  } catch (error) {
    console.error("Error creating ticket:", error);

    if (error.code === 11000) {
      res.status(409).json({
        message: "A ticket with this ID already exists. Please try again.",
        error: error.message,
      });
    } else {
      res
        .status(500)
        .json({ message: "Failed to create ticket", error: error.message });
    }
  }
};

const getTicket = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(401);
    throw new Error("User not found");
  }
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }

  if (ticket.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authorized");
  }

  res.status(200).json(ticket);
};

const updateTicket = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(401);
    throw new Error("User not authorized");
  }

  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }

  if (ticket.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("Not authorized");
  }

  const updatedTicket = await Ticket.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.status(200).json(updatedTicket);
};

const deleteTicket = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(401);
    throw new Error("User not authorized");
  }

  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }

  if (ticket.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("Not authorized");
  }

  await ticket.deleteOne();
  res.status(200).json({
    success: true,
  });
};

module.exports = {
  getTickets,
  createTicket,
  getTicket,
  updateTicket,
  deleteTicket,
};
