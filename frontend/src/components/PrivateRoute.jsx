import React from "react";
import useAuthStatus from "../hooks/useAuthStatus";
import Spinner from "./Spinner";
import { Navigate, Outlet } from "react-router-dom";

function PrivateRoute() {
  const { loggedIn, checkingStatus } = useAuthStatus();

  if (checkingStatus) {
    <Spinner />;
  }

  return loggedIn ? <Outlet /> : <Navigate to={"/login"} />;
}

export default PrivateRoute;
