import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Header from "./components/Header"; // Regular user header
import AdminHeader from "./components/AdminHeader"; // Admin specific header
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NewTicket from "./pages/NewTicket";
import PrivateRoute from "./components/PrivateRoute";
import Tickets from "./pages/Tickets";
import UserProfile from "./pages/UserProfile";
import Ticket from "./pages/Ticket";
import Footer from "./components/Footer";
import AdminDashboard from "./pages/AdminDashboard"; // Import the AdminDashboard component
import { useSelector } from "react-redux"; // Import useSelector to get user role
import UserManagement from "./pages/UserManagement";
import UserDetail from "./pages/UserDetail";

function App() {
  const { user } = useSelector((state) => state.auth); // Get user from Redux state

  return (
    <Router>
      <div className="flex flex-col min-h-screen font-sans">
        {/* Conditionally render Header based on user role */}
        {user && user.role === "admin" ? <AdminHeader /> : <Header />}

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />}></Route>
            <Route path="/login" element={<Login />}></Route>
            <Route path="/register" element={<Register />}></Route>

            {/* Protected Routes */}
            <Route
              path="/new-ticket"
              element={
                <PrivateRoute>
                  <NewTicket />
                </PrivateRoute>
              }
            />
            <Route
              path="/tickets"
              element={
                <PrivateRoute>
                  <Tickets />
                </PrivateRoute>
              }
            />
            <Route
              path="/ticket/:ticketId"
              element={
                <PrivateRoute>
                  <Ticket />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <UserProfile />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin-dashboard"
              element={
                <PrivateRoute requiredRole="admin">
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin-dashboard/users"
              element={
                <PrivateRoute requiredRole="admin">
                  <UserManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin-dashboard/users/:id"
              element={
                <PrivateRoute requiredRole="admin">
                  <UserDetail />
                </PrivateRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
      <ToastContainer />
    </Router>
  );
}

export default App;
