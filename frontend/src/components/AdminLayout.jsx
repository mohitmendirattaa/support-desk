import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import Footer from "./Footer";

import { fetchNotifications } from "../features/notifications/notificationSlice";

function AdminLayout() {
  const dispatch = useDispatch();

  useEffect(() => {
    console.log("AdminLayout: MOUNTED. Dispatching fetchNotifications.");
    dispatch(fetchNotifications());

    return () => {
      console.log("AdminLayout: UNMOUNTED.");
    };
  }, [dispatch]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-sans">
      <AdminHeader />

      <div className="flex flex-1 mt-20">
        <AdminSidebar />
        <main className="flex-1 p-6 sm:p-8 lg:p-10 bg-gray-100 overflow-auto">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden p-8 border border-gray-100 min-h-full flex flex-col">
            <Outlet />
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default AdminLayout;
