// backend/routes/notificationRoutes.js
const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  getNotifications,
  markNotificationAsSeen,
  markAllNotificationsAsSeen,
  getUnseenNotificationCount,
  deleteNotification,
  deleteAllNotifications,
} = require("../controllers/notificationController");

router.route("/").get(protect, getNotifications);
router.route("/:id/seen").put(protect, markNotificationAsSeen);
router.route("/mark-all-seen").put(protect, markAllNotificationsAsSeen);
router.route("/unseen-count").get(protect, getUnseenNotificationCount);
router.route("/all").delete(protect, deleteAllNotifications);
router.route("/:id").delete(protect, deleteNotification);

module.exports = router;
