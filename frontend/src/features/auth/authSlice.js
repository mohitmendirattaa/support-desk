// src/features/auth/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "./authService";

// Get user from localStorage (This is good for initial state)
const storedUser = localStorage.getItem("user");

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  isError: false,
  isLoading: false,
  isSuccess: false,
  message: "",
};

// Register user
export const register = createAsyncThunk(
  "auth/register",
  async (userData, thunkAPI) => {
    // Renamed 'user' to 'userData' for clarity
    try {
      // authService.register should ideally just register the user, not log them in.
      // If your backend automatically logs in after register and returns a token,
      // then you would handle it similar to login. But usually, register just creates the user.
      // Assuming register returns a success message or the new user *without* a token for login.
      // If it returns a token, you might need to reconsider your flow.
      return await authService.register(userData);
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

// Login user
export const login = createAsyncThunk(
  "auth/login",
  async (userData, thunkAPI) => {
    // Renamed 'user' to 'userData'
    try {
      const responseData = await authService.login(userData);
      // authService.login should set the user in localStorage internally as well
      // but we also set it here to be explicit and for Redux state.
      localStorage.setItem("user", JSON.stringify(responseData)); // Ensure data is stored in localStorage here
      return responseData; // Pass the user object (with token) to fulfilled
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

// Logout user
export const logout = createAsyncThunk("auth/logout", async () => {
  // authService.logout() should only clear local storage on its end.
  await authService.logout(); // This service function should clear localStorage.
});

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: (state) => {
      // This reset should generally only clear flags, not user state for login/logout
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Register Reducers ---
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.isError = false; // Reset error on new attempt
        state.isSuccess = false; // Reset success on new attempt
        state.message = ""; // Clear message
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // IMPORTANT: DO NOT set state.user here for *registration*.
        // Registration usually doesn't log the user in immediately.
        // The user must explicitly login after registering.
        // If your backend auto-logs in, this logic needs review.
        // For now, assuming standard registration:
        // state.user = null; // Don't set user on registration
        state.message =
          action.payload?.message || "User registered successfully!"; // Assuming backend sends a message
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload; // Error message from backend
        // state.user = null; // Do not clear user on failed registration, only on logout or failed login
      })
      // --- Login Reducers ---
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.isError = false; // Reset error on new attempt
        state.isSuccess = false; // Reset success on new attempt
        state.message = ""; // Clear message
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // THIS IS THE CRUCIAL LINE: Set the user object (containing the token)
        state.user = action.payload; // Action.payload should be { _id, name, email, token, etc. }
        // The user is already set in localStorage within the thunk for consistency
        state.message = "Logged in successfully!"; // Optional success message
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload; // Error message from backend
        state.user = null; // Clear user on failed login
        localStorage.removeItem("user"); // Clear from localStorage on failed login
      })
      // --- Logout Reducers ---
      .addCase(logout.fulfilled, (state) => {
        state.user = null; // Clear user from Redux state
        // localStorage.removeItem("user"); // This should be handled in authService.logout()
        state.isSuccess = false; // Reset success status after logout
        state.message = "Logged out successfully."; // Optional message
      });
  },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;
