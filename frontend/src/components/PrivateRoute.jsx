import React from "react";

import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

function PrivateRoute({ children }) {
  const { user } = useSelector((state) => state.auth);
  console.log(user);
  if (user) {
    return children;
  }

  return <Navigate to={"/login"} />;
}

export default PrivateRoute;
