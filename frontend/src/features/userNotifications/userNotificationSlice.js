// frontend/src/features/userNotifications/userNotificationSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import userNotificationService from "./userNotificationService"; // Import the new service

// Helper function to get error message
const getErrorMessage = (error) => {
  return (
    (error.response && error.response.data && error.response.data.message) ||
    error.message ||
    error.toString()
  );
};

const initialState = {
  userNotifications: [], // Renamed to clearly distinguish from admin notifications
  unseenCount: 0,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: "",
};

// Async Thunks for API interactions:

export const fetchUserNotifications = createAsyncThunk(
  "userNotifications/fetchAll",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await userNotificationService.getNotifications(token);
    } catch (error) {
      const message = getErrorMessage(error);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const markUserNotificationAsSeen = createAsyncThunk(
  "userNotifications/markSeen",
  async (notificationId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await userNotificationService.markAsSeen(notificationId, token);
    } catch (error) {
      const message = getErrorMessage(error);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const markAllUserNotificationsAsSeen = createAsyncThunk(
  "userNotifications/markAllSeen",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      await userNotificationService.markAllAsSeen(token);
      return; // No specific payload needed for deleting all
    } catch (error) {
      const message = getErrorMessage(error);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getUnseenUserNotificationsCount = createAsyncThunk(
  "userNotifications/getUnseenCount",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      const countResponse = await userNotificationService.getUnseenCount(token);
      return countResponse.unseenCount; // Backend returns { unseenCount: N }
    } catch (error) {
      const message = getErrorMessage(error);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const deleteUserNotification = createAsyncThunk(
  "userNotifications/delete",
  async (notificationId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      await userNotificationService.deleteNotification(notificationId, token);
      return notificationId; // Return the ID of the deleted notification for state update
    } catch (error) {
      const message = getErrorMessage(error);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const deleteAllUserNotifications = createAsyncThunk(
  "userNotifications/deleteAll",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      await userNotificationService.deleteAllNotifications(token);
      return; // No specific payload needed
    } catch (error) {
      const message = getErrorMessage(error);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// User Notification Redux Slice
export const userNotificationSlice = createSlice({
  name: "userNotifications", // Slice name
  initialState,
  reducers: {
    resetUserNotifications: (state) => initialState, // Specific reset for this slice

    // This reducer can be used for real-time updates via Socket.IO if implemented
    addUserNotification: (state, action) => {
      state.userNotifications.unshift(action.payload);
      if (!action.payload.isSeen) {
        state.unseenCount += 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // --- fetchUserNotifications ---
      .addCase(fetchUserNotifications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.message = "";
        state.userNotifications = action.payload; // Payload is the array of notifications
        state.unseenCount = action.payload.filter((n) => !n.isSeen).length;
      })
      .addCase(fetchUserNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.userNotifications = [];
        state.unseenCount = 0;
      })

      // --- markUserNotificationAsSeen ---
      .addCase(markUserNotificationAsSeen.fulfilled, (state, action) => {
        const updatedNotification = action.payload; // Backend returns the updated notification object
        const index = state.userNotifications.findIndex(
          (n) => n.id === updatedNotification.id
        );
        if (index !== -1 && !state.userNotifications[index].isSeen) {
          state.userNotifications[index].isSeen = true;
          state.userNotifications[index].updatedAt =
            updatedNotification.updatedAt;
          state.unseenCount = Math.max(0, state.unseenCount - 1);
        }
      })
      .addCase(markUserNotificationAsSeen.rejected, (state, action) => {
        state.isError = true;
        state.message = `Failed to mark notification as seen: ${action.payload}`;
      })

      // --- markAllUserNotificationsAsSeen ---
      .addCase(markAllUserNotificationsAsSeen.fulfilled, (state) => {
        state.userNotifications.forEach((notification) => {
          notification.isSeen = true;
        });
        state.unseenCount = 0;
      })
      .addCase(markAllUserNotificationsAsSeen.rejected, (state, action) => {
        state.isError = true;
        state.message = `Failed to mark all notifications as seen: ${action.payload}`;
      })

      // --- getUnseenUserNotificationsCount ---
      .addCase(getUnseenUserNotificationsCount.fulfilled, (state, action) => {
        state.unseenCount = action.payload; // Payload is just the number
      })
      .addCase(getUnseenUserNotificationsCount.rejected, (state, action) => {
        state.isError = true;
        state.message = `Failed to get unseen count: ${action.payload}`;
        state.unseenCount = 0;
      })

      // --- deleteUserNotification ---
      .addCase(deleteUserNotification.fulfilled, (state, action) => {
        const deletedId = action.payload; // Payload is the ID of the deleted notification
        const removedNotification = state.userNotifications.find(
          (n) => n.id === deletedId
        );
        state.userNotifications = state.userNotifications.filter(
          (n) => n.id !== deletedId
        );
        if (removedNotification && !removedNotification.isSeen) {
          state.unseenCount = Math.max(0, state.unseenCount - 1);
        }
        state.isSuccess = true;
        state.message = "Notification deleted successfully.";
      })
      .addCase(deleteUserNotification.rejected, (state, action) => {
        state.isError = true;
        state.message = `Failed to delete notification: ${action.payload}`;
      })

      // --- deleteAllUserNotifications ---
      .addCase(deleteAllUserNotifications.fulfilled, (state) => {
        state.userNotifications = []; // Clear all notifications
        state.unseenCount = 0; // Reset unseen count
        state.isSuccess = true;
        state.message = "All notifications deleted successfully.";
      })
      .addCase(deleteAllUserNotifications.rejected, (state, action) => {
        state.isError = true;
        state.message = `Failed to delete all notifications: ${action.payload}`;
      });
  },
});

export const { resetUserNotifications, addUserNotification } =
  userNotificationSlice.actions; // Export specific actions
export default userNotificationSlice.reducer;
