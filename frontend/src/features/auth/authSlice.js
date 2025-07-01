// frontend/src/features/auth/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "./authService";

const storedUser = localStorage.getItem("user");

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  isError: false,
  isLoading: false,
  isSuccess: false,
  message: "",
  isLoggingOut: false,
  justLoggedOut: false, // Flag to indicate a recent logout for PrivateRoute
};

// Register Thunk
export const register = createAsyncThunk(
  "auth/register",
  async (userData, thunkAPI) => {
    try {
      const response = await authService.register(userData);
      return response;
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

// Login Thunk
export const login = createAsyncThunk(
  "auth/login",
  async (userData, thunkAPI) => {
    try {
      const responseData = await authService.login(userData);
      return responseData;
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

// Logout Thunk
export const logout = createAsyncThunk("auth/logout", async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user?.token;

    if (!token) {
      localStorage.removeItem("user");
      return null;
    }

    await authService.logout(token);
    localStorage.removeItem("user");
    return null;
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    localStorage.removeItem("user");
    return thunkAPI.rejectWithValue(message);
  }
});

// Auth Slice Definition
export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
      // IMPORTANT: Do NOT reset justLoggedOut here. It's managed by setTimeout.
      // state.justLoggedOut = false;
    },
    setIsLoggingOut: (state, action) => {
      state.isLoggingOut = action.payload;
    },
    // Reducer to set the justLoggedOut flag
    setJustLoggedOut: (state, action) => {
      state.justLoggedOut = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register Cases
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message =
          action.payload?.message || "User registered successfully!";
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Login Cases
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "";
        state.isLoggingOut = false;
        state.justLoggedOut = false;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
        state.message = "Logged in successfully!";
        state.isLoggingOut = false;
        state.justLoggedOut = false;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
        localStorage.removeItem("user");
        state.isLoggingOut = false;
        state.justLoggedOut = false;
      })

      // Logout Cases
      .addCase(logout.pending, (state) => {
        state.isLoggingOut = true;
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "";
        state.justLoggedOut = false;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isSuccess = true;
        state.isLoading = false;
        state.isLoggingOut = false;
        state.message = "Logged out successfully.";
        state.justLoggedOut = true; // Set this to true on fulfilled
      })
      .addCase(logout.rejected, (state, action) => {
        state.user = null;
        state.isError = true;
        state.isLoading = false;
        state.isLoggingOut = false;
        state.message = action.payload || "Logout failed. Please try again.";
        state.justLoggedOut = true; // Set this to true even on rejected
      });
  },
});

export const { reset, setIsLoggingOut, setJustLoggedOut } = authSlice.actions;
export default authSlice.reducer;
