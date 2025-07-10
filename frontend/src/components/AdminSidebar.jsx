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
  PlusCircle,
  ClipboardList,
} from "lucide-react";

import { useSelector } from "react-redux";

function AdminSidebar() {
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path);

  // Get unseen notifications count from Redux state
  const unseenCount = useSelector(
    (state) => state.notifications?.unseenCount || 0
  );

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
              className={`flex items-center p-2 rounded-lg transition duration-200 ${
                location.pathname === "/admin-dashboard"
                  ? "bg-purple-700 text-white shadow-md"
                  : "hover:bg-gray-700 text-gray-300"
              }`}
            >
              <LayoutDashboard size={20} className="mr-3" />
              Dashboard
            </Link>
          </li>

          <li>
            <Link
              to="/admin-dashboard/new-ticket"
              className={`flex items-center p-2 rounded-lg transition duration-200 ${
                location.pathname === "/admin-dashboard/new-ticket"
                  ? "bg-purple-700 text-white shadow-md"
                  : "hover:bg-gray-700 text-gray-300"
              }`}
            >
              <PlusCircle size={20} className="mr-3" />
              Create New Ticket
            </Link>
          </li>

          <li>
            <Link
              to="/admin-dashboard/tickets"
              className={`flex items-center p-2 rounded-lg transition duration-200 ${
                location.pathname.startsWith("/admin-dashboard/tickets")
                  ? "bg-purple-700 text-white shadow-md"
                  : "hover:bg-gray-700 text-gray-300"
              }`}
            >
              <ClipboardList size={20} className="mr-3" />
              View My Tickets
            </Link>
          </li>

          <li>
            <Link
              to="/admin-dashboard/users"
              className={`flex items-center p-2 rounded-lg transition duration-200 ${
                isActive("/admin-dashboard/users")
                  ? "bg-purple-700 text-white shadow-md"
                  : "hover:bg-gray-700 text-gray-300"
              }`}
            >
              <Users size={20} className="mr-3" />
              User Management
            </Link>
          </li>

          <li>
            <Link
              to="/admin-dashboard/ticket-management"
              className={`flex items-center p-2 rounded-lg transition duration-200 ${
                isActive("/admin-dashboard/ticket-management") &&
                !location.pathname.includes("new-ticket")
                  ? "bg-purple-700 text-white shadow-md"
                  : "hover:bg-gray-700 text-gray-300"
              }`}
            >
              <Ticket size={20} className="mr-3" />
              Support Tickets
            </Link>
          </li>

          <li>
            <Link
              to="/admin-dashboard/analytics"
              className={`flex items-center p-2 rounded-lg transition duration-200 ${
                isActive("/admin-dashboard/analytics")
                  ? "bg-purple-700 text-white shadow-md"
                  : "hover:bg-gray-700 text-gray-300"
              }`}
            >
              <BarChart2 size={20} className="mr-3" />
              Detailed Analytics
            </Link>
          </li>

          <li>
            <Link
              to="/admin-dashboard/notifications"
              className={`relative flex items-center p-2 rounded-lg transition duration-200 ${
                isActive("/admin-dashboard/notifications")
                  ? "bg-purple-700 text-white shadow-md"
                  : "hover:bg-gray-700 text-gray-300"
              }`}
            >
              <Bell size={20} className="mr-3" />
              Notifications
              {unseenCount > 0 && (
                <span
                  className="absolute top-1 left-8 flex items-center justify-center
                    px-2 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full"
                  style={{ transform: "translateX(-50%)" }}
                >
                  {unseenCount}
                </span>
              )}
            </Link>
          </li>

          <li>
            <Link
              to="/admin-dashboard/data-management"
              className={`flex items-center p-2 rounded-lg transition duration-200 ${
                isActive("/admin-dashboard/data-management")
                  ? "bg-purple-700 text-white shadow-md"
                  : "hover:bg-gray-700 text-gray-300"
              }`}
            >
              <Database size={20} className="mr-3" />
              Data Management
            </Link>
          </li>

          {/* Optional: System Settings */}
          {/* <li>
            <Link
              to="/admin-dashboard/settings"
              className={`flex items-center p-2 rounded-lg transition duration-200 ${
                isActive("/admin-dashboard/settings")
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
