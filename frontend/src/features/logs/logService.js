// frontend/src/features/logs/logService.js
import axios from "axios"; // Import axios

const API_URL = "http://localhost:5000/api/logs";

/**
 * Fetches log entries from the API using axios, with optional filtering.
 * @param {object} filters - An object containing filtering criteria (from, to, userId).
 * @param {string} token - The authorization token.
 * @returns {Promise<Array>} A promise that resolves to an array of log records.
 * @throws {Error} If the API request fails.
 */
const getLogs = async (filters = {}, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    // Axios allows you to pass params object directly, it handles URLSearchParams internally
    params: {
      from: filters.from,
      to: filters.to,
      userId: filters.userId,
    },
  };

  try {
    const response = await axios.get(API_URL, config);
    return response.data; // Axios automatically parses JSON into .data
  } catch (error) {
    // Axios provides error details in error.response
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    throw new Error(message); // Re-throw with a consistent error message
  }
};

const logService = { getLogs };
export default logService;
