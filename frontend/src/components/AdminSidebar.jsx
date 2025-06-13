// src/components/AdminSidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Ticket,
  Settings,
  BarChart2,
  Bell,
  Database,
} from "lucide-react"; // Removed ShieldCheck and ClipboardList imports

function AdminSidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-gray-900 text-white p-6 shadow-xl flex flex-col rounded-r-3xl">
      {/* Admin Panel Title/Logo */}
      <div className="text-3xl font-extrabold mb-8 text-purple-400">
        Admin Panel
      </div>

      {/* Navigation Links */}
      <nav className="flex-1">
        <ul className="space-y-4">
          {/* Dashboard Link */}
          <li>
            <Link
              to="/admin-dashboard"
              className={`flex items-center p-3 rounded-lg transition-colors duration-200
                ${
                  location.pathname === "/admin-dashboard"
                    ? "bg-purple-700 text-white shadow-md"
                    : "hover:bg-gray-700 text-gray-300"
                }`}
            >
              <LayoutDashboard size={20} className="mr-3" />
              Dashboard
            </Link>
          </li>
          {/* User Management Link */}
          <li>
            <Link
              to="/admin-dashboard/users"
              className={`flex items-center p-3 rounded-lg transition-colors duration-200
                ${
                  location.pathname.startsWith("/admin-dashboard/users")
                    ? "bg-purple-700 text-white shadow-md"
                    : "hover:bg-gray-700 text-gray-300"
                }`}
            >
              <Users size={20} className="mr-3" />
              User Management
            </Link>
          </li>
          {/* Support Tickets Link */}
          <li>
            <Link
              to="/admin-dashboard/tickets"
              className={`flex items-center p-3 rounded-lg transition-colors duration-200
                ${
                  location.pathname.startsWith("/admin-dashboard/tickets")
                    ? "bg-purple-700 text-white shadow-md"
                    : "hover:bg-gray-700 text-gray-300"
                }`}
            >
              <Ticket size={20} className="mr-3" />
              Support Tickets
            </Link>
          </li>
          {/* Detailed Analytics Link */}
          <li>
            <Link
              to="/admin-dashboard/analytics"
              className={`flex items-center p-3 rounded-lg transition-colors duration-200
                ${
                  location.pathname.startsWith("/admin-dashboard/analytics") &&
                  location.pathname !== "/admin-dashboard"
                    ? "bg-purple-700 text-white shadow-md"
                    : "hover:bg-gray-700 text-gray-300"
                }`}
            >
              <BarChart2 size={20} className="mr-3" />
              Detailed Analytics
            </Link>
          </li>
          {/* Notifications Link */}
          <li>
            <Link
              to="/admin-dashboard/notifications"
              className={`flex items-center p-3 rounded-lg transition-colors duration-200
                ${
                  location.pathname.startsWith("/admin-dashboard/notifications")
                    ? "bg-purple-700 text-white shadow-md"
                    : "hover:bg-gray-700 text-gray-300"
                }`}
            >
              <Bell size={20} className="mr-3" />
              Notifications
            </Link>
          </li>
          {/* Data Management Link */}
          <li>
            <Link
              to="/admin-dashboard/data-management"
              className={`flex items-center p-3 rounded-lg transition-colors duration-200
                ${
                  location.pathname.startsWith(
                    "/admin-dashboard/data-management"
                  )
                    ? "bg-purple-700 text-white shadow-md"
                    : "hover:bg-gray-700 text-gray-300"
                }`}
            >
              <Database size={20} className="mr-3" />
              Data Management
            </Link>
          </li>
          {/* System Settings Link */}
          <li>
            <Link
              to="/admin-dashboard/settings"
              className={`flex items-center p-3 rounded-lg transition-colors duration-200
                ${
                  location.pathname.startsWith("/admin-dashboard/settings")
                    ? "bg-purple-700 text-white shadow-md"
                    : "hover:bg-gray-700 text-gray-300"
                }`}
            >
              <Settings size={20} className="mr-3" />
              System Settings
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default AdminSidebar;