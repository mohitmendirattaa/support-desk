// frontend/src/features/userNotifications/userNotificationService.js

import axios from "axios";

// Define the base API URL for user notifications
const API_URL = "http://localhost:5000/api/user-notifications/";

/**
 * Fetches all notifications for the authenticated user.
 * @param {string} token - The user's authentication token.
 * @returns {Promise<Array>} An array of user notification objects.
 */
const getNotifications = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(API_URL, config);
  return response.data;
};

/**
 * Marks a specific user notification as seen.
 * @param {number} notificationId - The ID of the notification to mark as seen.
 * @param {string} token - The user's authentication token.
 * @returns {Promise<object>} The updated notification object from the backend.
 */
const markAsSeen = async (notificationId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  // Using PATCH as per backend route definition for partial update
  const response = await axios.patch(
    API_URL + notificationId + "/seen",
    {}, // Empty body is fine for PATCH if no data is sent, just action
    config
  );
  return response.data;
};

/**
 * Marks all unseen notifications for the authenticated user as seen.
 * @param {string} token - The user's authentication token.
 * @returns {Promise<object>} A message indicating success.
 */
const markAllAsSeen = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  // Using PATCH as per backend route definition
  const response = await axios.patch(API_URL + "mark-all-seen", {}, config);
  return response.data;
};

/**
 * Fetches the count of unseen notifications for the authenticated user.
 * @param {string} token - The user's authentication token.
 * @returns {Promise<{unseenCount: number}>} An object containing the unseen count.
 */
const getUnseenCount = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(API_URL + "unseen-count", config);
  return response.data;
};

/**
 * Deletes a specific user notification.
 * @param {number} notificationId - The ID of the notification to delete.
 * @param {string} token - The user's authentication token.
 * @returns {Promise<object>} A message indicating success and the ID of the deleted notification.
 */
const deleteNotification = async (notificationId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.delete(API_URL + notificationId, config);
  return response.data;
};

/**
 * Deletes all notifications for the authenticated user.
 * @param {string} token - The user's authentication token.
 * @returns {Promise<object>} A message indicating success.
 */
const deleteAllNotifications = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.delete(API_URL + "all", config);
  return response.data;
};

const userNotificationService = {
  getNotifications,
  markAsSeen,
  markAllAsSeen,
  getUnseenCount,
  deleteNotification,
  deleteAllNotifications,
};

export default userNotificationService;
