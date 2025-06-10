import React, { useEffect, useRef } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

function PrivateRoute({ children, requiredRole }) {
  const { user } = useSelector((state) => state.auth);

  const toastShownRef = useRef(null);

  useEffect(() => {
    let currentAuthKey = "authorized";
    if (!user) {
      currentAuthKey = "not_logged_in";
    } else if (requiredRole && user.role !== requiredRole) {
      currentAuthKey = "role_mismatch";
    }

    if (
      currentAuthKey === toastShownRef.current &&
      currentAuthKey !== "authorized"
    ) {
      return;
    }

    if (currentAuthKey === "authorized") {
      if (toastShownRef.current !== null) {
        toastShownRef.current = null;
      }
      return;
    }

    if (currentAuthKey === "not_logged_in") {
      toast.error("You need to log in to access this page.");
      toastShownRef.current = "not_logged_in";
    } else if (currentAuthKey === "role_mismatch") {
      toast.error(
        `You do not have the necessary permissions to view this page.`
      );
      toastShownRef.current = "role_mismatch";
    }
  }, [user, requiredRole]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
}

export default PrivateRoute;

/* import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom"; // Import Outlet
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

function PrivateRoute({ children, requiredRole }) {
  // `children` prop is actually not needed here if used as a layout route,
  // but it's harmless to keep if you also use PrivateRoute in other ways.
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      toast.error("You need to log in to access this page.");
    } else if (requiredRole && user.role !== requiredRole) {
      toast.error(
        `You do not have the necessary permissions to view this page.`
      );
    }
  }, [user, requiredRole]);

  if (!user) {
    return <Navigate to="/login" />; // Redirect immediately if not logged in
  }

  // If a requiredRole is specified and the user's role does not match, redirect
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" />; // Redirect if role doesn't match
  }

  // If user is logged in and role matches (if requiredRole was specified),
  // render the nested child route using <Outlet />
  return children ? children : <Outlet />;
}

export default PrivateRoute;
 */
