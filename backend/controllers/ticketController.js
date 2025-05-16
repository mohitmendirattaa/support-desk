const User = require("../models/userModel");
const Ticket = require("../models/ticketModel");

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
    module,
    startDate,
    endDate,
    service,
    category,
  } = req.body;
  if (
    !description ||
    !priority ||
    !module ||
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
  }try {
    const ticket = await Ticket.create({
      priority,
      module,
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
    console.error("Error creating ticket:", error); // Log the error on the server
    res
      .status(500)
      .json({ message: "Failed to create ticket", error: error.message });
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
    throw new Error("User not aunthorized");
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
