// src/features/auth/authService.js
import axios from "axios"; // Ensure axios is imported

const API_URL = "http://localhost:5000/api/users/";

// Register user (should NOT log in the current user)
const register = async (userData) => {
  const res = await axios.post(API_URL, userData);
  // localStorage.setItem("user", JSON.stringify(res.data)); // <-- REMOVED THIS LINE
  return res.data;
};

// Login user (this IS where the current user gets logged in)
const login = async (userData) => {
  const res = await axios.post(API_URL + "login", userData);
  if (res.data) {
    localStorage.setItem("user", JSON.stringify(res.data));
  }
  return res.data;
};

// Logout user - CORRECTED
const logout = async (token) => {
  // Accept token as an argument
  // Make the POST request to the backend's logout endpoint
  // axios automatically sets Content-Type to application/json for POST requests
  const config = {
    headers: {
      Authorization: `Bearer ${token}`, // Include the Authorization header with the token
    },
  };
  const res = await axios.post(API_URL + "logout", {}, config); // Send empty object as body for POST

  // Regardless of backend response, remove user from localStorage immediately
  localStorage.removeItem("user");

  return res.data; // Return any data from the backend (e.g., success message)
};

const authService = {
  register,
  logout,
  login,
};

export default authService;
