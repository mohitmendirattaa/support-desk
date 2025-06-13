// src/features/auth/authService.js

import axios from "axios";

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

// Logout user
const logout = () => {
  localStorage.removeItem("user");
};

const authService = {
  register,
  logout,
  login,
};

export default authService;
