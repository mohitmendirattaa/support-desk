const User = require("../models/userModel");
const Ticket = require("../models/ticketModel");
const Note = require("../models/noteModel");
const Notification = require("../models/notificationModel");
const UserNotification = require("../models/userNotificationModel");
const multer = require("multer");
const asyncHandler = require("express-async-handler");

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

const getTickets = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(401);
    return next(new Error("User not found"));
  }
  const tickets = await Ticket.findByUserId(req.user.id);
  res.status(200).json(tickets);
});

const getTicket = asyncHandler(async (req, res, next) => {
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
});

const getSingleTicketForAdmin = asyncHandler(async (req, res, next) => {
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
});

const createTicket = asyncHandler(async (req, res, next) => {
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
    }
    const ticketDataToSave = {
      ticketIdPrefix,
      priority,
      subCategory,
      description,
      user: req.user.id,
      status: "open",
      startDate,
      endDate,
      service,
      category,
      attachmentBuffer,
      attachmentMimeType,
      attachmentFileName,
    };
    const newTicket = await Ticket.create(ticketDataToSave);
    if (!newTicket) {
      res.status(500);
      return next(
        new Error(
          "Failed to create ticket in database. Ticket object returned null."
        )
      );
    }
    const io = req.app.get("socketio");
    if (io) {
      const adminUsers = await User.findByRole("admin");
      if (!Array.isArray(adminUsers) || adminUsers.length === 0) {
        console.warn("No admin users found to notify about new ticket.");
      } else {
        const firstAdmin = adminUsers[0];
        const notificationData = {
          userId: firstAdmin.id,
          ticketId: newTicket.id,
          message: `New ticket #${newTicket.id} created by ${user.name} (${user.email}).`,
          notificationType: "newTicket",
          isSeen: false,
        };
        try {
          await Notification.create(notificationData);
        } catch (notificationDbError) {
          console.error(
            `ERROR: Failed to create notification for admin ${firstAdmin.id} for ticket ${newTicket.id}:`,
            notificationDbError.message
          );
        }
        io.emit("newTicketCreated", {
          ticketId: newTicket.id,
          description: newTicket.description,
          createdBy: user.name,
          priority: newTicket.priority,
          status: newTicket.status,
          message: `New ticket #${newTicket.id} has been created.`,
        });
      }
    } else {
      console.warn("Socket.IO not initialized or available on 'req.app'.");
    }
    res.status(201).json(newTicket);
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
    console.error("Critical Error during createTicket execution:", error);
    res.status(500);
    return next(
      new Error(
        `Failed to create ticket: ${
          error.message || "An unknown error occurred."
        }`
      )
    );
  }
});

const updateTicket = asyncHandler(async (req, res, next) => {
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

  const { status, reason, ...otherFields } = req.body;
  const fieldsToUpdate = { ...otherFields };

  if (req.file) {
    fieldsToUpdate.attachmentBuffer = req.file.buffer;
    fieldsToUpdate.attachmentMimeType = req.file.mimetype;
    fieldsToUpdate.attachmentFileName = req.file.originalname;
  }

  try {
    let updatedTicket;
    if (status && status !== ticket.status) {
      updatedTicket = await Ticket.updateStatus(req.params.id, status, reason);
    } else {
      updatedTicket = await Ticket.update(req.params.id, fieldsToUpdate);
    }

    if (!updatedTicket) {
      res.status(500);
      return next(new Error("Failed to update ticket."));
    }

    if (status && status !== ticket.status) {
      await Note.create({
        ticketId: updatedTicket.id,
        userId: req.user.id,
        userName: req.user.name,
        text: `Ticket status changed from '${ticket.status}' to '${
          updatedTicket.status
        }'. Reason: ${reason || "No reason provided."}`,
        isStaff: req.user.role === "admin",
      });

      const io = req.app.get("socketio");
      if (io) {
        console.log(
          `DEBUG: Current Admin User ID (req.user.id): ${req.user.id}`
        ); // NEW DEBUG LOG
        console.log(
          `DEBUG: Ticket's Creator ID (ticket.userId): ${ticket.userId}`
        ); // NEW DEBUG LOG

        const ticketCreator = await User.findById(ticket.userId);
        console.log(
          `DEBUG: Ticket Creator Found (boolean): ${!!ticketCreator}`
        );
        console.log(
          `DEBUG: Ticket Creator Object: ${JSON.stringify(ticketCreator)}`
        ); // NEW DEBUG LOG

        if (
          ticketCreator &&
          ticketCreator.id.toString() !== req.user.id.toString()
        ) {
          const userNotificationMessage = `Your ticket #${
            updatedTicket.id
          } status changed to '${updatedTicket.status}'. Reason: ${
            reason || "No reason provided."
          }`;
          const userNotificationData = {
            userId: ticketCreator.id,
            ticketId: updatedTicket.id,
            message: userNotificationMessage,
            notificationType: "ticketStatusUpdate",
            isSeen: false,
          };
          console.log(
            "DEBUG: Attempting to create UserNotification with data:",
            userNotificationData
          );
          try {
            await UserNotification.create(userNotificationData);
            console.log("DEBUG: UserNotification created successfully!");
            io.to(ticketCreator.id.toString()).emit("ticketStatusUpdated", {
              ticketId: updatedTicket.id,
              status: updatedTicket.status,
              message: userNotificationData.message,
            });
          } catch (err) {
            console.error(
              `ERROR: Failed to create user notification for ticket creator ${ticketCreator.id}:`,
              err.message,
              err.stack
            );
          }
        } else {
          console.log(
            "DEBUG: User notification not created. Either ticketCreator not found, or updater is the creator."
          );
        }
        const adminUsers = await User.findByRole("admin");
        if (Array.isArray(adminUsers) && adminUsers.length > 0) {
          for (const admin of adminUsers) {
            const notificationDataAdmin = {
              userId: admin.id,
              ticketId: updatedTicket.id,
              message: `Ticket #${updatedTicket.id} status updated to '${updatedTicket.status}' by ${req.user.name}.`,
              notificationType: "ticketStatusUpdateAdmin",
              isSeen: false,
            };
            try {
              await Notification.create(notificationDataAdmin);
              io.to(admin.id.toString()).emit("ticketStatusUpdatedAdmin", {
                ticketId: updatedTicket.id,
                status: updatedTicket.status,
                message: notificationDataAdmin.message,
              });
            } catch (err) {
              console.error(
                `ERROR: Failed to notify admin ${admin.id}:`,
                err.message
              );
            }
          }
        } else {
          console.warn(
            "No admin users found to notify about ticket status update."
          );
        }
      } else {
        console.warn("Socket.IO not initialized or available on 'req.app'.");
      }
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
    console.error("Critical Error during updateTicket execution:", error);
    res.status(500);
    return next(
      new Error(
        `Failed to update ticket: ${
          error.message || "An unknown error occurred."
        }`
      )
    );
  }
});

const deleteTicket = asyncHandler(async (req, res, next) => {
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
});

const getAllTicketsForAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user || !req.user.role || req.user.role !== "admin") {
    res.status(403);
    return next(new Error("Access forbidden. Admin role required."));
  }
  const tickets = await Ticket.findAllWithUserDetails();
  res.status(200).json(tickets);
});

const holdTicket = asyncHandler(async (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403);
    return next(
      new Error(
        "Access forbidden. Admin role required to put a ticket on hold."
      )
    );
  }
  const ticketId = req.params.id;
  const { reason } = req.body;
  const updatedTicket = await Ticket.updateStatus(ticketId, "hold", reason);

  if (!updatedTicket) {
    res.status(404);
    return next(new Error("Ticket not found or unable to update status."));
  }

  await Note.create({
    ticketId: updatedTicket.id,
    userId: req.user.id,
    userName: req.user.name,
    text: `Ticket status changed to 'hold'. Reason: ${
      reason || "No reason provided."
    }`,
    isStaff: true,
  });

  const io = req.app.get("socketio");
  if (io) {
    console.log(`DEBUG: Current Admin User ID (req.user.id): ${req.user.id}`); // NEW DEBUG LOG
    console.log(
      `DEBUG: Ticket's Creator ID (updatedTicket.userId): ${updatedTicket.userId}`
    ); // NEW DEBUG LOG

    const ticketCreator = await User.findById(updatedTicket.userId);
    console.log(`DEBUG: Ticket Creator Found (boolean): ${!!ticketCreator}`);
    console.log(
      `DEBUG: Ticket Creator Object: ${JSON.stringify(ticketCreator)}`
    ); // NEW DEBUG LOG

    if (ticketCreator) {
      // Removed the `!== req.user.id.toString()` check here for debugging purposes, will add back later
      const userNotificationMessage = `Your ticket #${
        updatedTicket.id
      } has been put on hold by an admin. Reason: ${
        reason || "No reason provided."
      }`;
      const userNotificationData = {
        userId: ticketCreator.id,
        ticketId: updatedTicket.id,
        message: userNotificationMessage,
        notificationType: "ticketStatusUpdate",
        isSeen: false,
      };
      console.log(
        "DEBUG: Attempting to create UserNotification with data:",
        userNotificationData
      );
      try {
        await UserNotification.create(userNotificationData);
        console.log("DEBUG: UserNotification created successfully!");
        io.to(ticketCreator.id.toString()).emit("ticketStatusUpdated", {
          ticketId: updatedTicket.id,
          status: updatedTicket.status,
          message: userNotificationData.message,
        });
      } catch (err) {
        console.error(
          `ERROR: Failed to create user notification for ticket creator ${ticketCreator.id}:`,
          err.message,
          err.stack
        );
      }
    } else {
      console.log(
        "DEBUG: User notification not created. Ticket creator not found."
      );
    }
  }
  res.status(200).json({
    message: `Ticket ${ticketId} put on hold.`,
    ticket: updatedTicket,
  });
});

const pendingTicket = asyncHandler(async (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403);
    return next(
      new Error(
        "Access forbidden. Admin role required to set a ticket to pending."
      )
    );
  }
  const ticketId = req.params.id;
  const { reason } = req.body;
  const updatedTicket = await Ticket.updateStatus(ticketId, "pending", reason);

  if (!updatedTicket) {
    res.status(404);
    return next(new Error("Ticket not found or unable to update status."));
  }

  await Note.create({
    ticketId: updatedTicket.id,
    userId: req.user.id,
    userName: req.user.name,
    text: `Ticket status changed to 'pending'. Reason: ${
      reason || "No reason provided."
    }`,
    isStaff: true,
  });

  const io = req.app.get("socketio");
  if (io) {
    console.log(`DEBUG: Current Admin User ID (req.user.id): ${req.user.id}`); // NEW DEBUG LOG
    console.log(
      `DEBUG: Ticket's Creator ID (updatedTicket.userId): ${updatedTicket.userId}`
    ); // NEW DEBUG LOG

    const ticketCreator = await User.findById(updatedTicket.userId);
    console.log(`DEBUG: Ticket Creator Found (boolean): ${!!ticketCreator}`);
    console.log(
      `DEBUG: Ticket Creator Object: ${JSON.stringify(ticketCreator)}`
    ); // NEW DEBUG LOG

    if (ticketCreator) {
      // Removed the `!== req.user.id.toString()` check here for debugging purposes, will add back later
      const userNotificationMessage = `Your ticket #${
        updatedTicket.id
      } status changed to 'pending' by an admin. Reason: ${
        reason || "No reason provided."
      }`;
      const userNotificationData = {
        userId: ticketCreator.id,
        ticketId: updatedTicket.id,
        message: userNotificationMessage,
        notificationType: "ticketStatusUpdate",
        isSeen: false,
      };
      console.log(
        "DEBUG: Attempting to create UserNotification with data:",
        userNotificationData
      );
      try {
        await UserNotification.create(userNotificationData);
        console.log("DEBUG: UserNotification created successfully!");
        io.to(ticketCreator.id.toString()).emit("ticketStatusUpdated", {
          ticketId: updatedTicket.id,
          status: updatedTicket.status,
          message: userNotificationData.message,
        });
      } catch (err) {
        console.error(
          `ERROR: Failed to create user notification for ticket creator ${ticketCreator.id}:`,
          err.message,
          err.stack
        );
      }
    } else {
      console.log(
        "DEBUG: User notification not created. Ticket creator not found."
      );
    }
  }
  res.status(200).json({
    message: `Ticket ${ticketId} set to pending.`,
    ticket: updatedTicket,
  });
});

const resolveTicket = asyncHandler(async (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403);
    return next(
      new Error("Access forbidden. Admin role required to resolve a ticket.")
    );
  }
  const ticketId = req.params.id;
  const { reason } = req.body;
  const updatedTicket = await Ticket.updateStatus(ticketId, "resolved", reason);

  if (!updatedTicket) {
    res.status(404);
    return next(new Error("Ticket not found or unable to update status."));
  }

  await Note.create({
    ticketId: updatedTicket.id,
    userId: req.user.id,
    userName: req.user.name,
    text: `Ticket status changed to 'resolved'. Reason: ${
      reason || "No reason provided."
    }`,
    isStaff: true,
  });

  const io = req.app.get("socketio");
  if (io) {
    console.log(`DEBUG: Current Admin User ID (req.user.id): ${req.user.id}`); // NEW DEBUG LOG
    console.log(
      `DEBUG: Ticket's Creator ID (updatedTicket.userId): ${updatedTicket.userId}`
    ); // NEW DEBUG LOG

    const ticketCreator = await User.findById(updatedTicket.userId);
    console.log(`DEBUG: Ticket Creator Found (boolean): ${!!ticketCreator}`);
    console.log(
      `DEBUG: Ticket Creator Object: ${JSON.stringify(ticketCreator)}`
    ); // NEW DEBUG LOG

    if (ticketCreator) {
      // Removed the `!== req.user.id.toString()` check here for debugging purposes, will add back later
      const userNotificationMessage = `Your ticket #${
        updatedTicket.id
      } has been resolved by an admin. Reason: ${
        reason || "No reason provided."
      }`;
      const userNotificationData = {
        userId: ticketCreator.id,
        ticketId: updatedTicket.id,
        message: userNotificationMessage,
        notificationType: "ticketStatusUpdate",
        isSeen: false,
      };
      console.log(
        "DEBUG: Attempting to create UserNotification with data:",
        userNotificationData
      );
      try {
        await UserNotification.create(userNotificationData);
        console.log("DEBUG: UserNotification created successfully!");
        io.to(ticketCreator.id.toString()).emit("ticketStatusUpdated", {
          ticketId: updatedTicket.id,
          status: updatedTicket.status,
          message: userNotificationData.message,
        });
      } catch (err) {
        console.error(
          `ERROR: Failed to create user notification for ticket creator ${ticketCreator.id}:`,
          err.message,
          err.stack
        );
      }
    } else {
      console.log(
        "DEBUG: User notification not created. Ticket creator not found."
      );
    }
  }
  res.status(200).json({
    message: `Ticket ${ticketId} resolved.`,
    ticket: updatedTicket,
  });
});

const closeTicket = asyncHandler(async (req, res, next) => {
  const { id: ticketId } = req.params;
  const { reason } = req.body;
  if (!req.user) {
    res.status(401);
    return next(new Error("Not authorized. Please log in."));
  }
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    res.status(404);
    return next(new Error("Ticket not found."));
  }
  if (
    req.user.role !== "admin" &&
    ticket.userId.toString() !== req.user.id.toString()
  ) {
    res.status(403);
    return next(
      new Error(
        "Access forbidden. You are not authorized to close this ticket."
      )
    );
  }
  if (ticket.status === "closed") {
    res.status(400);
    return next(new Error("Ticket is already closed."));
  }
  const updatedTicket = await Ticket.updateStatus(ticketId, "closed", reason);

  await Note.create({
    ticketId: ticketId,
    userId: req.user.id,
    userName: req.user.name,
    text: `Ticket closed by ${req.user.name || "User"}. Reason: ${
      reason || "No reason provided."
    }`,
    isStaff: req.user.role === "admin",
  });
  if (!updatedTicket) {
    res.status(500);
    return next(new Error("Failed to close ticket."));
  }
  const io = req.app.get("socketio");
  if (io) {
    console.log(`DEBUG: Current Admin User ID (req.user.id): ${req.user.id}`); // NEW DEBUG LOG
    console.log(
      `DEBUG: Ticket's Creator ID (updatedTicket.userId): ${updatedTicket.userId}`
    ); // NEW DEBUG LOG

    const ticketCreator = await User.findById(updatedTicket.userId);
    console.log(`DEBUG: Ticket Creator Found (boolean): ${!!ticketCreator}`);
    console.log(
      `DEBUG: Ticket Creator Object: ${JSON.stringify(ticketCreator)}`
    ); // NEW DEBUG LOG

    if (ticketCreator) {
      // Removed the `!== req.user.id.toString()` check here for debugging purposes, will add back later
      const userNotificationMessage = `Your ticket #${
        updatedTicket.id
      } has been closed. Reason: ${reason || "No reason provided."}`;
      const userNotificationData = {
        userId: ticketCreator.id,
        ticketId: updatedTicket.id,
        message: userNotificationMessage,
        notificationType: "ticketStatusUpdate",
        isSeen: false,
      };
      console.log(
        "DEBUG: Attempting to create UserNotification with data:",
        userNotificationData
      );
      try {
        await UserNotification.create(userNotificationData);
        console.log("DEBUG: UserNotification created successfully!");
        io.to(ticketCreator.id.toString()).emit("ticketStatusUpdated", {
          ticketId: updatedTicket.id,
          status: updatedTicket.status,
          message: userNotificationData.message,
        });
      } catch (err) {
        console.error(
          `ERROR: Failed to create user notification for ticket creator ${ticketCreator.id}:`,
          err.message,
          err.stack
        );
      }
    } else {
      console.log(
        "DEBUG: User notification not created. Ticket creator not found."
      );
    }
  }
  res
    .status(200)
    .json({ message: `Ticket ${ticketId} closed.`, ticket: updatedTicket });
});

module.exports = {
  getTickets,
  getTicket,
  getSingleTicketForAdmin,
  createTicket,
  updateTicket,
  deleteTicket,
  getAllTicketsForAdmin,
  holdTicket,
  pendingTicket,
  resolveTicket,
  closeTicket,
  upload,
};
