import React from "react";
import { Link } from "react-router-dom"; // Make sure Link is imported
import {
  LayoutDashboard,
  Users,
  Ticket,
  Settings,
  BarChart2, // Import for Analytics icon
  Bell,
  Database,
  ShieldCheck,
} from "lucide-react";

function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 font-sans flex items-center justify-center">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-indigo-700 to-purple-800 p-8 text-white text-center rounded-t-3xl">
          <h1 className="text-5xl sm:text-6xl font-extrabold mb-3 leading-tight">
            Admin Control Panel
          </h1>
          <p className="text-xl sm:text-2xl opacity-90">
            Empowering your administrative tasks with precision.
          </p>
        </div>

        <div className="p-6 sm:p-8 lg:p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Overview Card (not a link in your original code) */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300 ease-in-out flex flex-col items-center justify-center text-center">
            <LayoutDashboard size={48} className="mb-4 opacity-90" />
            <h2 className="text-3xl font-bold mb-2">Overview</h2>
            <p className="text-lg opacity-80">Quick glance at key metrics.</p>
          </div>

          {/* User Management Link */}
          <Link
            to="/admin-dashboard/users"
            className="bg-gradient-to-br from-green-500 to-green-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300 ease-in-out flex flex-col items-center justify-center text-center no-underline"
          >
            <Users size={48} className="mb-4 opacity-90" />
            <h2 className="text-3xl font-bold mb-2">User Management</h2>
            <p className="text-lg opacity-80">Handle user accounts & roles.</p>
          </Link>

          {/* Support Tickets Link */}
          <Link
            to="/admin-dashboard/tickets"
            className="bg-gradient-to-br from-yellow-500 to-yellow-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300 ease-in-out flex flex-col items-center justify-center text-center no-underline"
          >
            <Ticket size={48} className="mb-4 opacity-90" />
            <h2 className="text-3xl font-bold mb-2">Support Tickets</h2>
            <p className="text-lg opacity-80">Monitor and resolve issues.</p>
          </Link>

          {/* ANALYTICS LINK - THIS IS THE CHANGE */}
          <Link
            to="/admin-dashboard/analytics" // Define the path for your analytics page
            className="bg-gradient-to-br from-red-500 to-red-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300 ease-in-out flex flex-col items-center justify-center text-center no-underline"
          >
            <BarChart2 size={48} className="mb-4 opacity-90" />
            <h2 className="text-3xl font-bold mb-2">Analytics</h2>
            <p className="text-lg opacity-80">Dive into performance data.</p>
          </Link>

          {/* Notifications Card (not a link) */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300 ease-in-out flex flex-col items-center justify-center text-center">
            <Bell size={48} className="mb-4 opacity-90" />
            <h2 className="text-3xl font-bold mb-2">Notifications</h2>
            <p className="text-lg opacity-80">Manage system alerts.</p>
          </div>

          {/* System Settings Card (not a link) */}
          <div className="bg-gradient-to-br from-gray-600 to-gray-800 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300 ease-in-out flex flex-col items-center justify-center text-center">
            <Settings size={48} className="mb-4 opacity-90" />
            <h2 className="text-3xl font-bold mb-2">System Settings</h2>
            <p className="text-lg opacity-80">
              Configure application settings.
            </p>
          </div>

          {/* Data Management Card (not a link) */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300 ease-in-out flex flex-col items-center justify-center text-center">
            <Database size={48} className="mb-4 opacity-90" />
            <h2 className="text-3xl font-bold mb-2">Data Management</h2>
            <p className="text-lg opacity-80">Manage database & backups.</p>
          </div>

          {/* Security Center Card (not a link) */}
          <div className="bg-gradient-to-br from-cyan-500 to-cyan-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300 ease-in-out flex flex-col items-center justify-center text-center">
            <ShieldCheck size={48} className="mb-4 opacity-90" />
            <h2 className="text-3xl font-bold mb-2">Security Center</h2>
            <p className="text-lg opacity-80">Monitor security & audits.</p>
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:p-10 bg-gray-50 border-t border-gray-100 text-center rounded-b-3xl">
          <button className="px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-bold text-xl rounded-full shadow-xl hover:from-indigo-700 hover:to-purple-800 transform hover:-translate-y-1 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50">
            Access Advanced Tools
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
