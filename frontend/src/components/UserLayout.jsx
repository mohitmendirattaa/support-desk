// src/components/UserLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header"; // Import the regular user Header
import Footer from "./Footer"; // Import the Footer

function UserLayout() {
  return (
    <>
      <Header />
      <main className="flex-grow mt-20 min-h-[calc(100vh-80px)] pb-24  bg-gray-50">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default UserLayout;
