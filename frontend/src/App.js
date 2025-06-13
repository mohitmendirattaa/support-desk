import React from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import your new custom hook
import useAuthRedirect from "./hooks/useAuthRedirect";

// Page Components
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

// Layout Components
import PrivateRoute from "./components/PrivateRoute";
import AdminLayout from "./components/AdminLayout";
import UserLayout from "./components/UserLayout";

function App() {
  // Call your custom hook here.
  // It handles the redirection logic internally (fetching user, using navigate).
  useAuthRedirect();
  // useAuthStatus();

  return (
    <div className="flex flex-col min-h-screen font-sans">
      {/* BrowserRouter is in index.js, wrapping the App component */}
      <Routes>
        {/* User-facing routes, wrapped in UserLayout for consistent styling */}
        <Route element={<UserLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          {/* The public /register route was removed and moved under admin-dashboard */}

          {/* Private routes for any logged-in user */}
          <Route element={<PrivateRoute />}>
            <Route path="/new-ticket" element={<NewTicket />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/tickets/:ticketId" element={<Ticket />} />
            <Route path="/profile" element={<UserProfile />} />
          </Route>
        </Route>

        {/* Admin-specific routes, secured by PrivateRoute (requires 'admin' role) */}
        {/* These routes are also wrapped in AdminLayout for admin dashboard styling */}
        <Route
          path="/admin-dashboard"
          element={
            <PrivateRoute requiredRole="admin">
              <AdminLayout /> {/* AdminLayout will render its child routes */}
            </PrivateRoute>
          }
        >
          {/* Nested admin dashboard routes */}
          <Route index element={<AdminDashboard />} />{" "}
          {/* Renders at /admin-dashboard */}
          <Route path="users" element={<UserManagement />} />
          <Route path="users/:id" element={<UserDetail />} />
          <Route path="tickets" element={<AdminTicketsPage />} />
          <Route path="tickets/:ticketId" element={<ViewSingleTicket />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="register" element={<Register />} />
          <Route path="settings" element={<SystemSettings />} />
          <Route path="data-management" element={<DataManagementPage />} />
        </Route>
      </Routes>
      <ToastContainer /> {/* Toast notifications container */}
    </div>
  );
}

export default App;
