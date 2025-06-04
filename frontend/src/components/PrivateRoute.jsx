import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify"; 

function PrivateRoute({ children, requiredRole }) {
  // Accept a new prop: requiredRole
  const { user } = useSelector((state) => state.auth);
  if (!user) {
    toast.error("You need to log in to access this page.");
    return <Navigate to="/login" />;
  }
  if (requiredRole && user.role !== requiredRole) {
    toast.error(`You do not have the necessary permissions to view this page.`);
    return <Navigate to="/" />;
  }
  return children;
}

export default PrivateRoute;
