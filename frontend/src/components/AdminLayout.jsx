// src/components/AdminLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import Footer from "./Footer";

function AdminLayout() {
  return (
    <>
      <AdminHeader />

      {/*
        - min-h-[calc(100vh-80px)] ensures the main content area takes up
          at least the full viewport height, adjusted for the header's height (mt-20 implies ~80px height for header/offset).
        - pb-24 adds significant padding at the bottom of the main content area.
      */}
      <main className="mt-20 min-h-[calc(100vh-80px)] pb-24  bg-gray-100">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default AdminLayout;
