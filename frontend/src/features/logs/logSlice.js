// features/logs/logSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import logService from "./logService"; // This is the service for API calls
import { toast } from "react-toastify"; // For displaying notifications

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
      // Get the authentication token from the Redux 'auth' slice state
      // This assumes your auth slice has a 'user' object with a 'token' property.
      const token = thunkAPI.getState().auth.user?.token;

      // If no token is found, reject the thunk with an error message.
      if (!token) {
        return thunkAPI.rejectWithValue(
          "No authentication token found. Please log in."
        );
      }

      // Call the getLogs function from the logService, passing the token.
      return await logService.getLogs(token);
    } catch (error) {
      // Extract the error message from the response or the error object.
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      // Provide specific messages for common authorization errors (403 Forbidden, 401 Unauthorized)
      if (
        error.response &&
        (error.response.status === 403 || error.response.status === 401)
      ) {
        return thunkAPI.rejectWithValue(
          "Not authorized to view logs. Admin privileges required or session expired."
        );
      }

      // Reject the thunk with the error message
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
  },
  // extraReducers handle actions dispatched by createAsyncThunk
  extraReducers: (builder) => {
    builder
      // Handle the 'pending' state of the fetchLogs async thunk
      .addCase(fetchLogs.pending, (state) => {
        state.isLoadingLogs = true; // Set loading to true
        state.isErrorLogs = false; // Reset error state
        state.isSuccessLogs = false; // Reset success state
        state.messageLogs = ""; // Clear any previous messages
      })
      // Handle the 'fulfilled' state when logs are successfully fetched
      .addCase(fetchLogs.fulfilled, (state, action) => {
        state.isLoadingLogs = false; // Set loading to false
        state.isSuccessLogs = true; // Set success to true
        state.logs = action.payload; // Store the fetched logs in the 'logs' array
      })
      // Handle the 'rejected' state when fetching logs fails
      .addCase(fetchLogs.rejected, (state, action) => {
        state.isLoadingLogs = false; // Set loading to false
        state.isErrorLogs = true; // Set error to true
        state.messageLogs = action.payload; // Store the error message
        state.logs = []; // Clear logs on error
        toast.error(action.payload); // Display the error message using react-toastify
      });
  },
});

export const { resetLogs } = logSlice.actions; // Export the resetLogs action
export default logSlice.reducer; // Export the default reducer
