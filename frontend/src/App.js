import React from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import useAuthRedirect from "./hooks/useAuthRedirect";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NewTicket from "./pages/NewTicket";
import Tickets from "./pages/Tickets";
import Ticket from "./pages/Ticket";
import UserProfile from "./pages/UserProfile";
import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/UserManagement";
import UserDetail from "./pages/UserDetail";
import AdminTicketsPage from "./pages/TicketsPage";
import ViewSingleTicket from "./pages/ViewSingleTicket";
import AnalyticsPage from "./pages/AnalyticsPage";
import SystemSettings from "./pages/SystemSettings";
import DataManagementPage from "./pages/DataManagementPage.jsx";
import TicketStatusPage from "./pages/TicketStatusPage";
import NotificationPage from "./pages/NotificationPage"; // Existing import from your input
import UserNotification from "./pages/UserNotification"; // ✅ ADDED: Import for UserNotification

import PrivateRoute from "./components/PrivateRoute";
import AdminLayout from "./components/AdminLayout";
import UserLayout from "./components/UserLayout";

function App() {
  useAuthRedirect();

  return (
    <div className="flex flex-col min-h-screen font-sans">
      <Routes>
        <Route element={<UserLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          {/* Register is typically for both user/admin to create accounts */}
          <Route path="/register" element={<Register />} />

          <Route element={<PrivateRoute />}>
            <Route path="/new-ticket" element={<NewTicket />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/tickets/:ticketId" element={<Ticket />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/user-notifications" element={<UserNotification />} />
          </Route>
        </Route>

        <Route
          path="/admin-dashboard"
          element={
            <PrivateRoute requiredRole="admin">
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="users/:id" element={<UserDetail />} />
          <Route path="ticket-management" element={<AdminTicketsPage />} />
          <Route
            path="ticket-management/:ticketId"
            element={<ViewSingleTicket />}
          />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="register" element={<Register />} />
          <Route path="settings" element={<SystemSettings />} />
          <Route path="data-management" element={<DataManagementPage />} />
          <Route path="ticket-statuses" element={<TicketStatusPage />} />
          <Route path="new-ticket" element={<NewTicket />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="tickets/:ticketId" element={<Ticket />} />
          <Route path="ticket-management" element={<AdminTicketsPage />} />
          <Route path="notifications" element={<NotificationPage />} />
          {/* <Route path="/user-notifications" element={<UserNotification />} /> */}
         
        </Route>
      </Routes>
      <ToastContainer />
    </div>
  );
}

export default App;
