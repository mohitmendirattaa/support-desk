const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware"); // Assuming this middleware protects routes

const {
  getUserNotifications,
  markUserNotificationAsSeen,
  markAllUserNotificationsAsSeen,
  getUnseenUserNotificationCount,
  deleteUserNotification,
  deleteAllUserNotifications,
} = require("../controllers/userNotificationController"); // Import the new user-specific controller

// Base route to get all notifications for the authenticated user
router.route("/").get(protect, getUserNotifications);

// Route to mark a specific user notification as seen
router.route("/:id/seen").patch(protect, markUserNotificationAsSeen);

// Route to mark all user notifications as seen
router.route("/mark-all-seen").patch(protect, markAllUserNotificationsAsSeen);

// Route to get the count of unseen user notifications
router.route("/unseen-count").get(protect, getUnseenUserNotificationCount);

// Route to delete all user notifications
router.route("/all").delete(protect, deleteAllUserNotifications);

// Route to delete a specific user notification
router.route("/:id").delete(protect, deleteUserNotification);

module.exports = router;
