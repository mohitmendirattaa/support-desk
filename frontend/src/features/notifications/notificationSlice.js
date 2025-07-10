// frontend/src/features/notifications/notificationSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import notificationService from "./notificationService";

const initialState = {
  notifications: [],
  unseenCount: 0,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: "",
};

// Async Thunks for API interactions:

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await notificationService.getNotifications(token);
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

export const markNotificationAsSeen = createAsyncThunk(
  "notifications/markSeen",
  async (notificationId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await notificationService.markAsSeen(notificationId, token);
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

export const markAllNotificationsAsSeen = createAsyncThunk(
  "notifications/markAllSeen",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      await notificationService.markAllAsSeen(token);
      return;
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

export const getUnseenNotificationCount = createAsyncThunk(
  "notifications/getUnseenCount",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      const count = await notificationService.getUnseenCount(token);
      return count;
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

// Delete a notification
export const deleteNotification = createAsyncThunk(
  "notifications/delete",
  async (notificationId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      await notificationService.deleteNotification(notificationId, token);
      return notificationId;
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

// NAYA: Delete ALL notifications
export const deleteAllNotifications = createAsyncThunk(
  "notifications/deleteAll",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      await notificationService.deleteAllNotifications(token); // <--- NAYA: Call the service function
      return; // No specific payload needed for deleting all
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

// Notification Redux Slice
export const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    resetNotifications: (state) => initialState,

    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isSeen) {
        state.unseenCount += 1;
      }
    },

    updateNotification: (state, action) => {
      const { ticketId, status, message, notificationType, isSeen } =
        action.payload;

      const existingNotificationIndex = state.notifications.findIndex(
        (n) =>
          n.ticketId === ticketId && n.notificationType === notificationType
      );

      if (existingNotificationIndex !== -1) {
        const wasSeen = state.notifications[existingNotificationIndex].isSeen;
        state.notifications[existingNotificationIndex] = {
          ...state.notifications[existingNotificationIndex],
          message: message,
          isSeen: isSeen !== undefined ? isSeen : false,
          updatedAt: new Date().toISOString(),
        };

        if (wasSeen && !state.notifications[existingNotificationIndex].isSeen) {
          state.unseenCount += 1;
        } else if (
          !wasSeen &&
          state.notifications[existingNotificationIndex].isSeen
        ) {
          state.unseenCount = Math.max(0, state.unseenCount - 1);
        }
      } else {
        state.notifications.unshift({
          id: `socket-update-${Date.now()}-${Math.random()}`,
          userId: null,
          ticketId: ticketId,
          message: message,
          notificationType: notificationType,
          isSeen: isSeen !== undefined ? isSeen : false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        if (!state.notifications[0].isSeen) {
          state.unseenCount += 1;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.message = "";

        const fetchedNotifications =
          action.payload.data || action.payload.notifications || action.payload;

        if (Array.isArray(fetchedNotifications)) {
          state.notifications = fetchedNotifications;
          state.unseenCount = fetchedNotifications.filter(
            (n) => !n.isSeen
          ).length;
        } else {
          console.error(
            "fetchNotifications.fulfilled: Payload is not an array or expected wrapper object.",
            action.payload
          );
          state.notifications = [];
          state.unseenCount = 0;
          state.isError = true;
          state.message =
            "Failed to load notifications: Unexpected data format.";
        }
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.notifications = [];
        state.unseenCount = 0;
      })
      .addCase(markNotificationAsSeen.fulfilled, (state, action) => {
        const markedNotificationId = action.payload.id || action.payload;

        const index = state.notifications.findIndex(
          (notification) => notification.id === markedNotificationId
        );
        if (index !== -1 && !state.notifications[index].isSeen) {
          state.notifications[index].isSeen = true;
          state.notifications[index].updatedAt =
            action.payload.updatedAt || new Date().toISOString();
          state.unseenCount = Math.max(0, state.unseenCount - 1);
        }
      })
      .addCase(markNotificationAsSeen.rejected, (state, action) => {
        state.isError = true;
        state.message = `Failed to mark notification as seen: ${action.payload}`;
      })
      .addCase(markAllNotificationsAsSeen.fulfilled, (state) => {
        state.notifications.forEach((notification) => {
          notification.isSeen = true;
        });
        state.unseenCount = 0;
      })
      .addCase(markAllNotificationsAsSeen.rejected, (state, action) => {
        state.isError = true;
        state.message = `Failed to mark all notifications as seen: ${action.payload}`;
      })
      .addCase(getUnseenNotificationCount.fulfilled, (state, action) => {
        state.unseenCount = action.payload;
      })
      .addCase(getUnseenNotificationCount.rejected, (state, action) => {
        state.isError = true;
        state.message = `Failed to get unseen count: ${action.payload}`;
        state.unseenCount = 0;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const deletedId = action.payload;
        const removedNotification = state.notifications.find(
          (n) => n.id === deletedId
        );
        state.notifications = state.notifications.filter(
          (n) => n.id !== deletedId
        );
        if (removedNotification && !removedNotification.isSeen) {
          state.unseenCount = Math.max(0, state.unseenCount - 1);
        }
        state.isSuccess = true;
        state.message = "Notification deleted successfully.";
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.isError = true;
        state.message = `Failed to delete notification: ${action.payload}`;
      })
      // NAYA: Cases for deleteAllNotifications
      .addCase(deleteAllNotifications.fulfilled, (state) => {
        state.notifications = []; // Clear all notifications
        state.unseenCount = 0; // Reset unseen count
        state.isSuccess = true;
        state.message = "All notifications deleted successfully.";
      })
      .addCase(deleteAllNotifications.rejected, (state, action) => {
        state.isError = true;
        state.message = `Failed to delete all notifications: ${action.payload}`;
      });
  },
});

export const { resetNotifications, addNotification, updateNotification } =
  notificationSlice.actions;
export default notificationSlice.reducer;
