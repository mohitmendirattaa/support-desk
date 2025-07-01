import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Ticket,
  Settings, // Settings icon might still be useful for general admin section links
  BarChart2,
  Bell,
  Database,
  PlusCircle, // Added for New Ticket
  ClipboardList, // Added for View My Tickets
} from "lucide-react";

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
          <li>
            <Link
              to="/admin-dashboard"
              className={`flex items-center p-2 rounded-lg transition-colors duration-200
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
          {/* New Ticket Link for Admin */}
          <li>
            <Link
              to="/admin-dashboard/new-ticket"
              className={`flex items-center p-2 rounded-lg transition-colors duration-200
                ${
                  location.pathname === "/admin-dashboard/new-ticket"
                    ? "bg-purple-700 text-white shadow-md"
                    : "hover:bg-gray-700 text-gray-300"
                }`}
            >
              <PlusCircle size={20} className="mr-3" />
              Create New Ticket
            </Link>
          </li>
          {/* View My Tickets Link (User's personal tickets) */}
          <li>
            <Link
              to="/admin-dashboard/tickets" // This links to the user's personal tickets page
              className={`flex items-center p-2 rounded-lg transition-colors duration-200
                ${
                  location.pathname.startsWith("/admin-dashboard/tickets") &&
                  !location.pathname.startsWith("/admin-dashboard/tickets")
                    ? "bg-purple-700 text-white shadow-md"
                    : "hover:bg-gray-700 text-gray-300"
                }`}
            >
              <ClipboardList size={20} className="mr-3" />
              View My Tickets
            </Link>
          </li>
          {/* User Management Link */}
          <li>
            <Link
              to="/admin-dashboard/users"
              className={`flex items-center p-2 rounded-lg transition-colors duration-200
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
          {/* Support Tickets Link (Admin's view of all tickets) */}
          <li>
            <Link
              to="/admin-dashboard/ticket-management"
              className={`flex items-center p-2 rounded-lg transition-colors duration-200
                ${
                  location.pathname.startsWith(
                    "/admin-dashboard/ticket-management"
                  ) && !location.pathname.includes("new-ticket")
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
              className={`flex items-center p-2 rounded-lg transition-colors duration-200
                ${
                  location.pathname.startsWith("/admin-dashboard/analytics")
                    ? "bg-purple-700 text-white shadow-md"
                    : "hover:bg-gray-700 text-gray-300"
                }`}
            >
              <BarChart2 size={20} className="mr-3" />
              Detailed Analytics
            </Link>
          </li>
          {/* Notifications Link (Assuming this route exists) */}
          <li>
            <Link
              to="/admin-dashboard/notifications"
              className={`flex items-center p-2 rounded-lg transition-colors duration-200
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
              className={`flex items-center p-2 rounded-lg transition-colors duration-200
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
          {/* System Settings - Removed as per request, but keeping icon for reference */}
          {/* <li>
            <Link
              to="/admin-dashboard/settings"
              className={`flex items-center p-2 rounded-lg transition-colors duration-200
                ${
                  location.pathname.startsWith("/admin-dashboard/settings")
                    ? "bg-purple-700 text-white shadow-md"
                    : "hover:bg-gray-700 text-gray-300"
                }`}
            >
              <Settings size={20} className="mr-3" />
              System Settings
            </Link>
          </li> */}
        </ul>
      </nav>
    </aside>
  );
}

export default AdminSidebar;
