// frontend/src/components/PrivateRoute.jsx

import React, { useEffect, useRef } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

function PrivateRoute({ children, requiredRole }) {
  // NEW: Destructure justLoggedOut from auth state
  const { user, isLoggingOut, justLoggedOut } = useSelector(
    (state) => state.auth
  );
  const location = useLocation();

  const lastToastState = useRef(null);

  useEffect(() => {
    // --- CRITICAL GUARD: Prioritize justLoggedOut and isLoggingOut ---
    // If a logout was just initiated/completed, or we're on the login page,
    // suppress any toasts from PrivateRoute.
    if (justLoggedOut || isLoggingOut || location.pathname === "/login") {
      lastToastState.current = null; // Reset toast state for future valid unauthorized attempts
      return; // Exit the useEffect early, preventing any toast logic below this point
    }

    let currentAuthStatus = "authorized";
    if (!user) {
      currentAuthStatus = "not_logged_in";
    } else if (requiredRole && user.role !== requiredRole) {
      currentAuthStatus = "role_mismatch";
    }

    // If the user is currently authorized, reset the toast state and do nothing
    if (currentAuthStatus === "authorized") {
      lastToastState.current = null;
      return;
    }

    // If not authorized, and we haven't shown this specific toast for this status yet, show it
    if (currentAuthStatus === "not_logged_in") {
      if (lastToastState.current !== "not_logged_in") {
        toast.error("You need to log in to access this page.");
        lastToastState.current = "not_logged_in";
      }
    } else if (currentAuthStatus === "role_mismatch") {
      if (lastToastState.current !== "role_mismatch") {
        toast.error(
          `You do not have the necessary permissions to view this page.`
        );
        lastToastState.current = "role_mismatch";
      }
    }
  }, [user, requiredRole, isLoggingOut, justLoggedOut, location.pathname]); // NEW: Add justLoggedOut to dependencies

  // These render conditions determine actual navigation and must remain outside useEffect
  if (!user) {
    return <Navigate to="/login" replace />; // Redirect if not logged in
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />; // Redirect if role doesn't match
  }

  return children ? children : <Outlet />; // Render child routes or Outlet if authorized
}

export default PrivateRoute;
