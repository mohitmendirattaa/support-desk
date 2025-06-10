// features/users/userSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import userService from "./userService";
import { toast } from "react-toastify";

// Initial state for user management (all users, single user, loading, error)
const initialState = {
  allUsers: [],
  singleUser: null,
  isLoadingUsers: false,
  isErrorUsers: false,
  messageUsers: "",
  isSuccessUsers: false,
};

// Async Thunk to fetch all users
export const fetchAllUsers = createAsyncThunk(
  "users/fetchAll",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      if (!token) {
        return thunkAPI.rejectWithValue("No authentication token found");
      }
      return await userService.getAllUsers(token);
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

// Async Thunk to fetch a single user by ID
export const fetchSingleUser = createAsyncThunk(
  "users/fetchSingle",
  async (userId, thunkAPI) => {
    // 'userId' received here must be a valid GUID
    try {
      const token = thunkAPI.getState().auth.user.token;
      if (!token) {
        return thunkAPI.rejectWithValue("No authentication token found");
      }
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

// Async Thunk to update user status
export const updateUserStatus = createAsyncThunk(
  "users/updateUserStatus",
  async ({ id, status }, thunkAPI) => {
    // 'id' received here must be a valid GUID
    try {
      const token = thunkAPI.getState().auth.user.token;
      if (!token) {
        return thunkAPI.rejectWithValue("No authentication token found");
      }
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

// Async Thunk to update user details
export const updateUser = createAsyncThunk(
  "users/update",
  async ({ userId, userData }, thunkAPI) => {
    // 'userId' received here must be a valid GUID
    try {
      const token = thunkAPI.getState().auth.user.token;
      if (!token) {
        return thunkAPI.rejectWithValue("No authentication token found");
      }
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
  name: "users",
  initialState,
  reducers: {
    resetUserManagement: (state) => {
      state.allUsers = [];
      state.singleUser = null;
      state.isLoadingUsers = false;
      state.isErrorUsers = false;
      state.messageUsers = "";
      state.isSuccessUsers = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllUsers.pending, (state) => {
        state.isLoadingUsers = true;
        state.isErrorUsers = false;
        state.messageUsers = "";
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.isLoadingUsers = false;
        state.isSuccessUsers = true;
        state.allUsers = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.isLoadingUsers = false;
        state.isErrorUsers = true;
        state.messageUsers = action.payload;
        state.allUsers = [];
      })
      .addCase(fetchSingleUser.pending, (state) => {
        state.isLoadingUsers = true;
        state.isErrorUsers = false;
        state.messageUsers = "";
        state.singleUser = null;
      })
      .addCase(fetchSingleUser.fulfilled, (state, action) => {
        state.isLoadingUsers = false;
        state.isSuccessUsers = true;
        state.singleUser = action.payload;
      })
      .addCase(fetchSingleUser.rejected, (state, action) => {
        state.isLoadingUsers = false;
        state.isErrorUsers = true;
        state.messageUsers = action.payload;
        state.singleUser = null;
      })
      .addCase(updateUserStatus.pending, (state) => {
        state.isLoadingUsers = true;
        state.isErrorUsers = false;
        state.messageUsers = "";
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        state.isLoadingUsers = false;
        state.isSuccessUsers = true;
        // CHANGE HERE: Use action.payload.id instead of action.payload._id
        state.allUsers = state.allUsers.map((user) =>
          user.id === action.payload.id ? action.payload : user
        );
        toast.success("User status updated successfully!");
      })
      .addCase(updateUserStatus.rejected, (state, action) => {
        state.isLoadingUsers = false;
        state.isErrorUsers = true;
        state.messageUsers = action.payload;
        toast.error(action.payload);
      })
      .addCase(updateUser.pending, (state) => {
        state.isLoadingUsers = true;
        state.isErrorUsers = false;
        state.messageUsers = "";
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoadingUsers = false;
        state.isSuccessUsers = true;
        state.singleUser = action.payload;
        // CHANGE HERE: Use action.payload.id instead of action.payload._id
        state.allUsers = state.allUsers.map((user) =>
          user.id === action.payload.id ? action.payload : user
        );
        toast.success("User updated successfully!");
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoadingUsers = false;
        state.isErrorUsers = true;
        state.messageUsers = action.payload;
        toast.error(action.payload);
      });
  },
});

export const { resetUserManagement } = userSlice.actions;
export default userSlice.reducer;
