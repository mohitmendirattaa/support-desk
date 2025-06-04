// services/userService.js
import axios from "axios";

// Base URL for your user API
const API_URL = "http://localhost:5000/api/users/";

// Function to get all users
const getAllUsers = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(API_URL + "all", config);
  return response.data;
};

// Function to get a single user by ID
const getSingleUser = async (userId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(API_URL + userId, config);

  return response.data;
};

// NEW: Function to update user status
const updateUserStatus = async (userId, status, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  // Send a PUT request to update the user's status
  const response = await axios.put(
    `${API_URL}${userId}/status`, // Changed from `${API_URL}/${userId}/status`
    { status }, // Send the new status in the request body
    config
  );
  return response.data; // Return the updated user data
};

// NEW: Function to update user details
const updateUser = async (userId, userData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  // Send a PUT request to update the user's details
  const response = await axios.put(`${API_URL}${userId}`, userData, config);
  return response.data; // Return the updated user data
};

const userService = {
  getAllUsers,
  getSingleUser,
  updateUserStatus,
  updateUser, // Export the new updateUser function
};

export default userService;
