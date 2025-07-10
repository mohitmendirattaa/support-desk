// backend/controllers/userNotificationController.js
const asyncHandler = require("express-async-handler");
const UserNotification = require("../models/userNotificationModel"); // Use the new model
const User = require("../models/userModel"); // Still needed for user checks

// @desc    Get all notifications for the authenticated user
// @route   GET /api/user-notifications
// @access  Private (User)
const getUserNotifications = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(401);
    throw new Error("User not found");
  }

  // Fetch notifications ONLY for this specific user
  const notifications = await UserNotification.findByUserId(req.user.id);

  res.status(200).json(notifications);
});

// @desc    Mark a specific user notification as seen
// @route   PATCH /api/user-notifications/:id/seen
// @access  Private (User)
const markUserNotificationAsSeen = asyncHandler(async (req, res) => {
  const { id } = req.params; // This 'id' is UserNotificationId
  console.log(
    `DEBUG_CONTROLLER: markUserNotificationAsSeen called with ID: '${id}' (Type: ${typeof id})`
  );

  const notification = await UserNotification.findById(id);

  if (!notification) {
    res.status(404);
    throw new Error("User notification not found");
  }

  // Ensure the notification belongs to the authenticated user
  if (notification.userId.toString() !== req.user.id.toString()) {
    res.status(401);
    throw new Error("Not authorized to mark this user notification as seen");
  }

  const updatedNotification = await UserNotification.markAsSeen(id);

  if (!updatedNotification) {
    res.status(500);
    throw new Error("Failed to mark user notification as seen");
  }

  res.status(200).json(updatedNotification);
});

// @desc    Mark all user notifications as seen for the authenticated user
// @route   PATCH /api/user-notifications/mark-all-seen
// @access  Private (User)
const markAllUserNotificationsAsSeen = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await User.findById(userId);
  if (!user) {
    res.status(401);
    throw new Error("User not found");
  }

  const success = await UserNotification.markAllAsSeenByUserId(userId);

  if (!success) {
    console.log(
      `No unseen user notifications for user ${userId} to mark as seen.`
    );
  }

  res.status(200).json({ message: "All user notifications marked as seen." });
});

// @desc    Get unseen user notification count for the authenticated user
// @route   GET /api/user-notifications/unseen-count
// @access  Private (User)
const getUnseenUserNotificationCount = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const count = await UserNotification.getUnseenCountByUserId(userId);
  res.status(200).json({ unseenCount: count });
});

// @desc    Delete a specific user notification
// @route   DELETE /api/user-notifications/:id
// @access  Private (User)
const deleteUserNotification = asyncHandler(async (req, res) => {
  const { id } = req.params; // This 'id' is UserNotificationId
  const userId = req.user.id;
  console.log(
    `DEBUG_CONTROLLER: deleteUserNotification called with ID: '${id}' (Type: ${typeof id})`
  );

  const notification = await UserNotification.findById(id);

  if (!notification) {
    res.status(404);
    throw new Error("User notification not found");
  }

  // Ensure the notification belongs to the authenticated user
  if (notification.userId.toString() !== userId.toString()) {
    res.status(401);
    throw new Error("Not authorized to delete this user notification");
  }

  const rowsAffected = await UserNotification.delete(id, userId);

  if (rowsAffected === 0) {
    res.status(500);
    throw new Error(
      "Failed to delete user notification or notification not found/authorized."
    );
  }

  res.status(200).json({
    message: "User notification deleted successfully",
    id: id,
    rowsAffected: rowsAffected,
  });
});

// @desc    Delete all user notifications for the authenticated user
// @route   DELETE /api/user-notifications/delete-all
// @access  Private (User)
const deleteAllUserNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await User.findById(userId);
  if (!user) {
    res.status(401);
    throw new Error("User not found");
  }

  const rowsAffected = await UserNotification.deleteAllByUserId(userId);

  res.status(200).json({
    message: "All user notifications deleted successfully",
    rowsAffected: rowsAffected,
  });
});

module.exports = {
  getUserNotifications,
  markUserNotificationAsSeen,
  markAllUserNotificationsAsSeen,
  getUnseenUserNotificationCount,
  deleteUserNotification,
  deleteAllUserNotifications,
};
