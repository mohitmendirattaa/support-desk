// features/logs/logSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import logService from "./logService"; // This is the service for API calls
// import { toast } from "react-toastify"; // For displaying notifications (optional)

// Initial state for the logs slice
const initialState = {
  logs: [], // Array to store the fetched log entries
  isLoadingLogs: false, // Flag to indicate if logs are currently being loaded
  isErrorLogs: false, // Flag to indicate if an error occurred during loading
  isSuccessLogs: false, // Flag to indicate if logs were successfully loaded
  messageLogs: "", // Message for errors or success
};

/**
 * @desc Async Thunk to fetch all logs from the backend.
 * This thunk will handle the API call to your /api/logs endpoint.
 * It expects a JWT token for authentication from the auth slice state.
 */
export const fetchLogs = createAsyncThunk(
  "logs/fetchAll", // Action type prefix
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      if (!token) {
        // toast.error("No authentication token found. Please log in."); // Uncomment if using toast
        return thunkAPI.rejectWithValue(
          "No authentication token found. Please log in."
        );
      }
      return await logService.getLogs(token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      if (
        error.response &&
        (error.response.status === 403 || error.response.status === 401)
      ) {
        // toast.error("Not authorized to view logs. Admin privileges required or session expired."); // Uncomment if using toast
        return thunkAPI.rejectWithValue(
          "Not authorized to view logs. Admin privileges required or session expired."
        );
      }
      // toast.error(message); // Uncomment if using toast
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create the logSlice using createSlice from Redux Toolkit
const logSlice = createSlice({
  name: "logs", // Name of the slice
  initialState, // Initial state defined above
  reducers: {
    /**
     * @desc Reducer to reset the log state.
     * This is useful for clearing logs, e.g., when a user logs out.
     */
    resetLogs: (state) => {
      state.logs = [];
      state.isLoadingLogs = false;
      state.isErrorLogs = false;
      state.isSuccessLogs = false;
      state.messageLogs = "";
    },
    /**
     * @desc Reducer to add a log entry directly to the frontend state.
     * This log will NOT be persisted to the database.
     * @param {object} action.payload - The log entry data (e.g., { UserID, Action, Message, Timestamp, Details })
     */
    addLocalLog: (state, action) => {
      // Naye log entry ko logs array ke shuru mein add karein
      // (taki woh sabse upar dikhe)
      state.logs.unshift(action.payload);
      // Optional: Agar logs ki sankhya bahut zyada ho rahi hai, toh limit kar sakte hain
      // state.logs = state.logs.slice(0, 100); // Only keep the latest 100 logs
    },
  },
  // extraReducers handle actions dispatched by createAsyncThunk
  extraReducers: (builder) => {
    builder
      // fetchLogs cases
      .addCase(fetchLogs.pending, (state) => {
        state.isLoadingLogs = true;
        state.isErrorLogs = false;
        state.isSuccessLogs = false;
        state.messageLogs = "";
      })
      .addCase(fetchLogs.fulfilled, (state, action) => {
        state.isLoadingLogs = false;
        state.isSuccessLogs = true;
        state.logs = action.payload; // Store the fetched logs in the 'logs' array
      })
      .addCase(fetchLogs.rejected, (state, action) => {
        state.isLoadingLogs = false;
        state.isErrorLogs = true;
        state.messageLogs = action.payload;
        state.logs = []; // Clear logs on error
        // toast.error(action.payload); // Uncomment if using toast
      });
  },
});

export const { resetLogs, addLocalLog } = logSlice.actions; // Naye action 'addLocalLog' ko export karein
export default logSlice.reducer; // Export the default reducer