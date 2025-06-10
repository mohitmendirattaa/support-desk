import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Page Components
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NewTicket from "./pages/NewTicket";
import Tickets from "./pages/Tickets";
import Ticket from "./pages/Ticket"; // Single ticket view for regular users
import UserProfile from "./pages/UserProfile";
import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/UserManagement";
import UserDetail from "./pages/UserDetail";
import AdminTicketsPage from "./pages/TicketsPage"; // Admin's list of all tickets
import ViewSingleTicket from "./pages/ViewSingleTicket"; // Admin's detailed view of any single ticket
import AnalyticsPage from "./pages/AnalyticsPage";

// Layout Components
import PrivateRoute from "./components/PrivateRoute";
import AdminLayout from "./components/AdminLayout";
import UserLayout from "./components/UserLayout";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen font-sans">
        <Routes>
          <Route element={<UserLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<PrivateRoute />}>
              <Route path="/new-ticket" element={<NewTicket />} />
              <Route path="/tickets" element={<Tickets />} />
              <Route path="/tickets/:ticketId" element={<Ticket />} />
              <Route path="/profile" element={<UserProfile />} />
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
            <Route path="tickets" element={<AdminTicketsPage />} />
            <Route path="tickets/:ticketId" element={<ViewSingleTicket />} />
            <Route path="analytics" element={<AnalyticsPage />} />
          </Route>
        </Routes>
      </div>
      <ToastContainer />
    </Router>
  );
}

export default App;
