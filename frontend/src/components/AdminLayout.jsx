import React from "react";
import { Outlet } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar"; // Import the AdminSidebar component
import Footer from "./Footer";

function AdminLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-sans">
      <AdminHeader />

      <div className="flex flex-1 mt-20">
        <AdminSidebar />
        {/* Main Content Area - takes up remaining space */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10 bg-gray-100 overflow-auto">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden p-8 border border-gray-100 min-h-full flex flex-col">
            {/* Outlet for nested routes (e.g., AdminDashboard, UsersPage) */}
            <Outlet />
          </div>
        </main>
      </div>

      {/* Footer remains at the very bottom */}
      <Footer />
    </div>
  );
}

export default AdminLayout;
