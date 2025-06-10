// src/controllers/ticketController.js

const User = require("../models/userModel");
const Ticket = require("../models/ticketModel"); // Your MSSQL TicketModel

/**
 * @desc Get tickets for the authenticated user
 * @route GET /api/tickets
 * @access Private
 */
const getTickets = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(401);
      return next(new Error("User not found"));
    }

    // Assuming Ticket.findByUserId uses the correct MSSQL query
    const tickets = await Ticket.findByUserId(req.user.id);

    res.status(200).json(tickets);
  } catch (error) {
    console.error("Error getting tickets:", error);
    return next(error);
  }
};

/**
 * @desc Get single ticket for authenticated user
 * @route GET /api/tickets/:id
 * @access Private
 */
const getTicket = async (req, res, next) => {
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

    // Authorize only the ticket creator or an admin to view this ticket
    // Ensure consistent type comparison for IDs (e.g., convert to string if one is a GUID object)
    if (
      ticket.userId.toString() !== req.user.id.toString() &&
      !req.user.isAdmin
    ) {
      res.status(401);
      return next(new Error("User not authorized to view this ticket"));
    }

    res.status(200).json(ticket);
  } catch (error) {
    console.error("Error getting ticket:", error);
    return next(error);
  }
};

/**
 * @desc Get any single ticket for admin, including associated user details
 * @route GET /api/tickets/admin/:id
 * @access Private/Admin
 */
const getSingleTicketForAdmin = async (req, res, next) => {
  try {
    // This controller assumes `authorizeRoles(['admin'])` middleware
    // has already verified the user's role.
    // A direct role check here is a redundant but safe fallback:
    if (!req.user || req.user.role !== "admin") {
      res.status(403);
      return next(new Error("Access forbidden. Admin role required."));
    }

    // Use the new model method that fetches ticket with joined user details
    const ticket = await Ticket.findByIdWithUserDetails(req.params.id);

    if (!ticket) {
      res.status(404);
      return next(new Error("Ticket not found"));
    }

    res.status(200).json(ticket);
  } catch (error) {
    console.error("Error getting single ticket for admin:", error);
    // Pass the error to the next middleware (error handler)
    return next(error);
  }
};

/**
 * @desc Create a new ticket
 * @route POST /api/tickets
 * @access Private
 */
const createTicket = async (req, res, next) => {
  const {
    description,
    priority,
    subCategory,
    startDate,
    endDate,
    service, // Maps to ServiceType in DB
    category,
  } = req.body;

  // Basic validation for required fields
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
    return next(new Error("Please add all required fields"));
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(401);
      return next(new Error("User not found"));
    }

    // Determine ticket ID prefix based on service type
    let ticketIdPrefix;
    if (service === "Service Request") {
      ticketIdPrefix = `SR`;
    } else if (service === "Incident") {
      ticketIdPrefix = `IN`;
    } else {
      ticketIdPrefix = `GEN`;
      console.warn(
        `Unexpected service type: "${service}". Using generic ID prefix: ${ticketIdPrefix}`
      );
    }

    // Pass 'user' (which is req.user.id) directly to the TicketModel create method
    const ticket = await Ticket.create({
      ticketIdPrefix,
      priority,
      subCategory,
      description,
      user: req.user.id, // Ensure this is the userId (GUID) from the authenticated user
      status: "new",
      startDate,
      endDate,
      service,
      category,
    });

    res.status(201).json(ticket);
  } catch (error) {
    console.error("Error creating ticket:", error);
    return next(error);
  }
};

/**
 * @desc Update ticket
 * @route PUT /api/tickets/:id
 * @access Private
 */
const updateTicket = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(401);
      return next(new Error("User not authorized"));
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      res.status(404);
      return next(new Error("Ticket not found"));
    }

    // Authorize only the ticket creator or an admin to update this ticket
    if (
      ticket.userId.toString() !== req.user.id.toString() &&
      !req.user.isAdmin
    ) {
      res.status(401);
      return next(new Error("Not authorized to update this ticket"));
    }

    // Call the TicketModel's update method
    const updatedTicket = await Ticket.update(req.params.id, req.body);

    if (!updatedTicket) {
      res.status(500); // Or 404 if the update didn't find the ticket
      return next(new Error("Failed to update ticket."));
    }

    res.status(200).json(updatedTicket);
  } catch (error) {
    console.error("Error updating ticket:", error);
    return next(error);
  }
};

/**
 * @desc Delete ticket
 * @route DELETE /api/tickets/:id
 * @access Private
 */
const deleteTicket = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(401);
      return next(new Error("User not authorized"));
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      res.status(404);
      return next(new Error("Ticket not found"));
    }

    // Authorize only the ticket creator or an admin to delete this ticket
    if (
      ticket.userId.toString() !== req.user.id.toString() &&
      !req.user.isAdmin
    ) {
      res.status(401);
      return next(new Error("Not authorized to delete this ticket"));
    }

    // Call the TicketModel's delete method
    const deleted = await Ticket.delete(req.params.id);

    if (!deleted) {
      res.status(500); // Or 404 if the delete didn't find the ticket
      return next(new Error("Failed to delete ticket."));
    }

    res.status(200).json({
      success: true,
      message: `Ticket ${req.params.id} deleted successfully.`,
    });
  } catch (error) {
    console.error("Error deleting ticket:", error);
    return next(error);
  }
};

/**
 * @desc Get all tickets for admin view, including user details
 * @route GET /api/tickets/admin
 * @access Private/Admin
 */
const getAllTicketsForAdmin = async (req, res, next) => {
  try {
    // This controller assumes `authorizeRoles(['admin'])` middleware
    // has already verified the user's role.
    // A direct role check here is a redundant but safe fallback:
    if (!req.user || !req.user.role || req.user.role !== "admin") {
      res.status(403);
      return next(new Error("Access forbidden. Admin role required."));
    }

    // Fetch all tickets using the new model method that joins with user details
    const tickets = await Ticket.findAllWithUserDetails();

    res.status(200).json(tickets);
  } catch (error) {
    console.error("Error getting all tickets for admin:", error);
    return next(error);
  }
};

module.exports = {
  getTickets,
  getTicket, // User's specific ticket view
  getSingleTicketForAdmin, // NEW: Admin's specific ticket view (any ticket)
  createTicket,
  updateTicket,
  deleteTicket,
  getAllTicketsForAdmin, // Admin's view of all tickets
};
