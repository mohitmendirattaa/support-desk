// frontend/src/features/notifications/notificationService.js

import axios from "axios";

const API_URL = "http://localhost:5000/api/notifications/"; 

// Fetch notifications
const getNotifications = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(API_URL, config);
  return response.data;
};

// Mark a notification as seen
const markAsSeen = async (notificationId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.put(
    API_URL + notificationId + "/seen",
    {},
    config
  );
  return response.data;
};

// Mark all notifications as seen
const markAllAsSeen = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.put(API_URL + "mark-all-seen", {}, config);
  return response.data;
};

// Get unseen notification count
const getUnseenCount = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(API_URL + "unseen-count", config);
  return response.data;
};

// Delete a notification
const deleteNotification = async (notificationId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.delete(API_URL + notificationId, config);
  return response.data;
};

// NAYA: Delete ALL notifications
const deleteAllNotifications = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  // Assuming backend endpoint for deleting all is DELETE /api/notifications/all
  const response = await axios.delete(API_URL + "all", config); // <--- NAYA: Ye line
  return response.data;
};

const notificationService = {
  getNotifications,
  markAsSeen,
  markAllAsSeen,
  getUnseenCount,
  deleteNotification,
  deleteAllNotifications, // <--- NAYA: Ye function export kiya hai
};

export default notificationService;
