// features/users/userSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import userService from "./userService"; // Import the user service
import { toast } from "react-toastify"; // Import toast for notifications

// Initial state for user management (all users, single user, loading, error)
const initialState = {
  allUsers: [],
  singleUser: null, // State to hold a single user's data
  isLoadingUsers: false,
  isErrorUsers: false,
  messageUsers: "", // For error messages
  isSuccessUsers: false, // Added for general success state
};

// Async Thunk to fetch all users (existing)
export const fetchAllUsers = createAsyncThunk(
  "users/fetchAll", // Action type prefix
  async (_, thunkAPI) => {
    try {
      // Get the user token from the auth state (assuming it's available)
      const token = thunkAPI.getState().auth.user.token;
      if (!token) {
        // If no token, reject the thunk with an error message
        return thunkAPI.rejectWithValue("No authentication token found");
      }
      // Call the service function to fetch users
      return await userService.getAllUsers(token);
    } catch (error) {
      // Handle errors from the API call
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      // Reject the thunk with the error message
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Async Thunk to fetch a single user by ID (existing)
export const fetchSingleUser = createAsyncThunk(
  "users/fetchSingle", // Action type prefix for fetching a single user
  async (userId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      if (!token) {
        return thunkAPI.rejectWithValue("No authentication token found");
      }
      // Call the service function to fetch a single user
      return await userService.getSingleUser(userId, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// NEW: Async Thunk to update user status (existing)
export const updateUserStatus = createAsyncThunk(
  "users/updateUserStatus", // Action type prefix for updating user status
  async ({ id, status }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      if (!token) {
        return thunkAPI.rejectWithValue("No authentication token found");
      }
      // Call the service function to update user status
      return await userService.updateUserStatus(id, status, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// NEW: Async Thunk to update user details
export const updateUser = createAsyncThunk(
  "users/update", // Action type prefix for updating user details
  async ({ userId, userData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      if (!token) {
        return thunkAPI.rejectWithValue("No authentication token found");
      }
      // Call the service function to update user details
      return await userService.updateUser(userId, userData, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const userSlice = createSlice({
  name: "users", // Slice name
  initialState, // Initial state
  reducers: {
    // Reducer to reset user management state (e.g., on logout or component unmount)
    resetUserManagement: (state) => {
      state.allUsers = [];
      state.singleUser = null;
      state.isLoadingUsers = false;
      state.isErrorUsers = false;
      state.messageUsers = "";
      state.isSuccessUsers = false; // Reset success state
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle pending state for fetchAllUsers
      .addCase(fetchAllUsers.pending, (state) => {
        state.isLoadingUsers = true;
        state.isErrorUsers = false; // Reset error on new request
        state.messageUsers = "";
      })
      // Handle fulfilled (success) state for fetchAllUsers
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.isLoadingUsers = false;
        state.isSuccessUsers = true;
        state.allUsers = action.payload; // Store the fetched users
      })
      // Handle rejected (failure) state for fetchAllUsers
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.isLoadingUsers = false;
        state.isErrorUsers = true;
        state.messageUsers = action.payload; // Store the error message
        state.allUsers = []; // Clear users on error
      })
      // Handle pending state for fetchSingleUser
      .addCase(fetchSingleUser.pending, (state) => {
        state.isLoadingUsers = true; // Reusing isLoadingUsers for single user fetch
        state.isErrorUsers = false;
        state.messageUsers = "";
        state.singleUser = null; // Clear previous single user data
      })
      // Handle fulfilled (success) state for fetchSingleUser
      .addCase(fetchSingleUser.fulfilled, (state, action) => {
        state.isLoadingUsers = false;
        state.isSuccessUsers = true;
        state.singleUser = action.payload; // Store the fetched single user
      })
      // Handle rejected (failure) state for fetchSingleUser
      .addCase(fetchSingleUser.rejected, (state, action) => {
        state.isLoadingUsers = false;
        state.isErrorUsers = true;
        state.messageUsers = action.payload; // Store the error message
        state.singleUser = null; // Clear single user on error
      })
      // Handle pending state for updateUserStatus
      .addCase(updateUserStatus.pending, (state) => {
        state.isLoadingUsers = true;
        state.isErrorUsers = false;
        state.messageUsers = "";
      })
      // Handle fulfilled (success) state for updateUserStatus
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        state.isLoadingUsers = false;
        state.isSuccessUsers = true;
        // Update the specific user in the allUsers array
        state.allUsers = state.allUsers.map((user) =>
          user._id === action.payload._id ? action.payload : user
        );
        toast.success("User status updated successfully!"); // Success toast
      })
      // Handle rejected (failure) state for updateUserStatus
      .addCase(updateUserStatus.rejected, (state, action) => {
        state.isLoadingUsers = false;
        state.isErrorUsers = true;
        state.messageUsers = action.payload; // Store the error message
        toast.error(action.payload); // Error toast
      })
      // NEW: Handle pending state for updateUser
      .addCase(updateUser.pending, (state) => {
        state.isLoadingUsers = true;
        state.isErrorUsers = false;
        state.messageUsers = "";
      })
      // NEW: Handle fulfilled (success) state for updateUser
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoadingUsers = false;
        state.isSuccessUsers = true;
        state.singleUser = action.payload; // Update the singleUser with the new data
        // Also update in allUsers if it's currently populated
        state.allUsers = state.allUsers.map((user) =>
          user._id === action.payload._id ? action.payload : user
        );
        toast.success("User updated successfully!"); // Success toast
      })
      // NEW: Handle rejected (failure) state for updateUser
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoadingUsers = false;
        state.isErrorUsers = true;
        state.messageUsers = action.payload; // Store the error message
        toast.error(action.payload); // Error toast
      });
  },
});

export const { resetUserManagement } = userSlice.actions; // Export actions
export default userSlice.reducer; // Export the reducer
