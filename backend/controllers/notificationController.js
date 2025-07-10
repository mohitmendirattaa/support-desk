const asyncHandler = require("express-async-handler");
const Notification = require("../models/notificationModel");
const User = require("../models/userModel");

const getNotifications = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error(
      "Access forbidden. Admin role required to view notifications."
    );
  }

  const notifications = await Notification.getAdminDashboardNotifications(
    req.user.id
  );

  res.status(200).json(notifications);
});

const markNotificationAsSeen = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // --- NAYA LOG: Idhar dekhenge kya ID aa rahi hai ---
  console.log(
    `DEBUG_CONTROLLER: markNotificationAsSeen called with ID: '${id}' (Type: ${typeof id})`
  );
  // ----------------------------------------------------

  const notification = await Notification.findById(id);

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }

  if (
    notification.userId.toString() !== req.user.id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(401);
    throw new Error("Not authorized to mark this notification as seen");
  }

  const updatedNotification = await Notification.markAsSeen(id);

  if (!updatedNotification) {
    res.status(500);
    throw new Error("Failed to mark notification as seen");
  }

  res.status(200).json(updatedNotification);
});

const markAllNotificationsAsSeen = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await User.findById(userId);
  if (!user) {
    res.status(401);
    throw new Error("User not found");
  }

  const success = await Notification.markAllAsSeenByUserId(userId);

  if (!success) {
    console.log(`No unseen notifications for user ${userId} to mark as seen.`);
  }

  res.status(200).json({ message: "All notifications marked as seen." });
});

const getUnseenNotificationCount = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const count = await Notification.getUnseenCountByUserId(userId);

  res.status(200).json({ unseenCount: count });
});

const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  // --- NAYA LOG: Idhar dekhenge kya ID aa rahi hai ---
  console.log(
    `DEBUG_CONTROLLER: deleteNotification called with ID: '${id}' (Type: ${typeof id})`
  );
  // ----------------------------------------------------

  const notification = await Notification.findById(id);

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }

  if (
    notification.userId.toString() !== userId.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(401);
    throw new Error("Not authorized to delete this notification");
  }

  const rowsAffected = await Notification.delete(id, userId);

  if (rowsAffected === 0) {
    res.status(500);
    throw new Error(
      "Failed to delete notification or notification not found/authorized."
    );
  }

  res.status(200).json({
    message: "Notification deleted successfully",
    id: id,
    rowsAffected: rowsAffected,
  });
});

const deleteAllNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await User.findById(userId);
  if (!user) {
    res.status(401);
    throw new Error("User not found");
  }

  const rowsAffected = await Notification.deleteAllByUserId(userId);

  res.status(200).json({
    message: "All notifications deleted successfully",
    rowsAffected: rowsAffected,
  });
});

module.exports = {
  getNotifications,
  markNotificationAsSeen,
  markAllNotificationsAsSeen,
  getUnseenNotificationCount,
  deleteNotification,
  deleteAllNotifications,
};
