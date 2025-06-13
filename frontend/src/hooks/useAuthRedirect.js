// src/hooks/useAuthRedirect.js
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * Custom hook to handle user redirection based on authentication status and role.
 * Redirects admins to their dashboard, and regular users away from restricted/login pages.
 */
function useAuthRedirect() {
  // Get the user object from the Redux state.
  // This will be populated from 'localStorage' via authSlice.js.
  const { user } = useSelector((state) => state.auth);

  // Initialize the useNavigate hook for programmatic navigation.
  const navigate = useNavigate();

  // useEffect hook to handle the redirection logic.
  // This runs when the component mounts or when the 'user' state changes.
  useEffect(() => {
    // If a user is logged in (or their session is persisted)
    if (user) {
      // If the user's role is 'admin'
      if (user.role === "admin") {
        // If the current path is the home page, login page, or register page,
        // redirect them directly to the admin dashboard.
        if (
          window.location.pathname === "/" ||
          window.location.pathname === "/login" ||
          window.location.pathname === "/register"
        ) {
          // Use navigate with { replace: true } to prevent adding the old path to history.
          navigate("/admin-dashboard", { replace: true });
        }
      } else {
        // If the user is NOT an admin (i.e., a regular user)
        // And they are currently on the login page, register page, or any admin-specific path,
        // redirect them to a default user page (e.g., '/tickets').
        if (
          window.location.pathname === "/login" ||
          window.location.pathname === "/register" ||
          window.location.pathname.startsWith("/admin-dashboard")
        ) {
          // Redirect to a suitable user page, replacing the current history entry.
          navigate("/tickets", { replace: true });
        }
      }
    }
    // The effect depends on the 'user' state and the 'navigate' function.
  }, [user, navigate]);
}

export default useAuthRedirect;
