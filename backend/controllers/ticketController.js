const User = require("../models/userModel");
const Ticket = require("../models/ticketModel");
const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Unsupported file type. Only images (JPEG, PNG, GIF), PDFs, and Word documents (DOC, DOCX) are allowed."
      ),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter,
});

const getTickets = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(401);
      return next(new Error("User not found"));
    }

    const tickets = await Ticket.findByUserId(req.user.id);

    res.status(200).json(tickets);
  } catch (error) {
    console.error("Error getting tickets:", error);
    return next(error);
  }
};

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

    if (
      ticket.userId.toString() !== req.user.id.toString() &&
      req.user.role !== "admin"
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

const getSingleTicketForAdmin = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      res.status(403);
      return next(new Error("Access forbidden. Admin role required."));
    }

    const ticket = await Ticket.findByIdWithUserDetails(req.params.id);

    if (!ticket) {
      res.status(404);
      return next(new Error("Ticket not found"));
    }

    res.status(200).json(ticket);
  } catch (error) {
    console.error("Error getting single ticket for admin:", error);
    return next(error);
  }
};

const createTicket = async (req, res, next) => {
  const {
    description,
    priority,
    subCategory,
    startDate,
    endDate,
    service,
    category,
  } = req.body;

  const attachmentBuffer = req.file ? req.file.buffer : null;
  const attachmentMimeType = req.file ? req.file.mimetype : null;
  const attachmentFileName = req.file ? req.file.originalname : null;

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

    const ticket = await Ticket.create({
      ticketIdPrefix,
      priority,
      subCategory,
      description,
      user: req.user.id,
      status: "new",
      startDate,
      endDate,
      service,
      category,
      attachmentBuffer,
      attachmentMimeType,
      attachmentFileName,
    });

    res.status(201).json(ticket);
  } catch (error) {
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        res.status(400);
        return next(new Error("File size too large. Maximum 5MB allowed."));
      }
    } else if (error.message.includes("Unsupported file type")) {
      res.status(400);
      return next(error);
    }

    console.error("Error creating ticket:", error);
    return next(error);
  }
};

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

    if (
      ticket.userId.toString() !== req.user.id.toString() &&
      req.user.role !== "admin"
    ) {
      res.status(401);
      return next(new Error("Not authorized to update this ticket"));
    }

    const fieldsToUpdate = { ...req.body };

    if (req.file) {
      fieldsToUpdate.attachmentBuffer = req.file.buffer;
      fieldsToUpdate.attachmentMimeType = req.file.mimetype;
      fieldsToUpdate.attachmentFileName = req.file.originalname;
    }

    const updatedTicket = await Ticket.update(req.params.id, fieldsToUpdate);

    if (!updatedTicket) {
      res.status(500);
      return next(new Error("Failed to update ticket."));
    }

    res.status(200).json(updatedTicket);
  } catch (error) {
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        res.status(400);
        return next(new Error("File size too large. Maximum 5MB allowed."));
      }
    } else if (error.message.includes("Unsupported file type")) {
      res.status(400);
      return next(error);
    }

    console.error("Error updating ticket:", error);
    return next(error);
  }
};

const deleteTicket = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(401);
      return next(new Error("User not authorized"));
    }

    const ticketIdToDelete = req.params.id;

    const ticket = await Ticket.findById(ticketIdToDelete);

    if (!ticket) {
      res.status(404);
      return next(new Error(`Ticket with ID '${ticketIdToDelete}' not found.`));
    }

    if (
      ticket.userId.toString() !== req.user.id.toString() &&
      req.user.role !== "admin"
    ) {
      res.status(401);
      return next(new Error("Not authorized to delete this ticket"));
    }

    const deleted = await Ticket.delete(ticketIdToDelete);

    if (!deleted) {
      res.status(500);
      return next(
        new Error(`Failed to delete ticket with ID '${ticketIdToDelete}'.`)
      );
    }

    res.status(200).json({
      success: true,
      message: `Ticket '${ticketIdToDelete}' deleted successfully.`,
    });
  } catch (error) {
    console.error("Error deleting ticket:", error);
    return next(error);
  }
};

const getAllTicketsForAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.role || req.user.role !== "admin") {
      res.status(403);
      return next(new Error("Access forbidden. Admin role required."));
    }

    const tickets = await Ticket.findAllWithUserDetails();

    res.status(200).json(tickets);
  } catch (error) {
    console.error("Error getting all tickets for admin:", error);
    return next(error);
  }
};

module.exports = {
  getTickets,
  getTicket,
  getSingleTicketForAdmin,
  createTicket,
  updateTicket,
  deleteTicket,
  getAllTicketsForAdmin,
  upload,
};
