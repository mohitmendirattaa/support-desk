import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import ticketReducer from "../features/tickets/ticketSlice";
import userReducer from "../features/users/userSlice";
import analyticReducer from "../features/analytics/analyticSlice";
import noteReducer from "../features/notes/noteSlice";
import logReducer from "../features/logs/logSlice";
import notificationReducer from "../features/notifications/notificationSlice";
import userNotificationReducer from "../features/userNotifications/userNotificationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tickets: ticketReducer,
    users: userReducer,
    analytics: analyticReducer,
    notes: noteReducer,
    logs: logReducer,
    notifications: notificationReducer,
    userNotifications: userNotificationReducer,
  },
});
