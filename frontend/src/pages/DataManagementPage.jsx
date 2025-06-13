import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Spinner from "../components/Spinner"; // Adjust path if needed
import { toast } from "react-toastify"; // Ensure react-toastify is installed and configured

// Import Redux actions from your analyticSlice
import {
  getTotalUsers,
  getTicketStatus,
  reset as resetAnalytics,
} from "../features/analytics/analyticSlice";

// Lucide-React Icons (assuming you have them installed: `npm install lucide-react`)
import { Users, Ticket, GaugeCircle } from "lucide-react"; // GaugeCircle for main header icon

// Inline SVG for Warning Icon (for error/access denied messages)
const WarningIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.308 18c-.77 1.333.192 3 1.732 3z"
    ></path>
  </svg>
);

function DataManagementPage() {
  const dispatch = useDispatch();

  const { totalUsers, ticketsByStatus, isLoading, isError, message } =
    useSelector((state) => state.analytics);

  const { user: authUser } = useSelector((state) => state.auth);

  const [totalTicketCount, setTotalTicketCount] = useState(0);

  useEffect(() => {
    if (isError && message) {
      toast.error(message);
    }

    dispatch(resetAnalytics());

    if (authUser && authUser.role === "admin") {
      dispatch(getTotalUsers());
      dispatch(getTicketStatus());
    }
  }, [dispatch, authUser, isError, message]);

  useEffect(() => {
    if (ticketsByStatus && ticketsByStatus.length > 0) {
      const calculatedTotalTickets = ticketsByStatus.reduce(
        (sum, item) => sum + item.count,
        0
      );
      setTotalTicketCount(calculatedTotalTickets);
    } else {
      setTotalTicketCount(0);
    }
  }, [ticketsByStatus]);

  // --- Conditional Renders ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
        <div className="bg-white p-10 rounded-xl shadow-lg text-center w-full max-w-md border border-red-200">
          <WarningIcon className="text-red-500 w-16 h-16 mx-auto mb-6 animate-pulse" />
          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            Data Loading Error
          </h1>
          <p className="text-gray-700 text-lg mb-6">
            {message || "Failed to retrieve data. Please try again."}
          </p>
          <p className="text-sm text-gray-500">
            Verify your administrator login and backend service status.
          </p>
        </div>
      </div>
    );
  }

  if (!authUser || authUser.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
        <div className="bg-white p-10 rounded-xl shadow-lg text-center w-full max-w-md border border-orange-200">
          <WarningIcon className="text-orange-500 w-16 h-16 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            Access Denied
          </h1>
          <p className="text-gray-700 text-lg">
            You must be an administrator to view this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 lg:p-8">
        {" "}
        {/* Adjusted max-w and padding */}
        {/* Main Content Header - Mimics "All Tickets (Admin View)" */}
        <div className="pb-6 border-b border-gray-200 mb-8 flex items-center justify-between">
          <div className="flex items-center">
            <GaugeCircle size={32} className="text-indigo-600 mr-3" />{" "}
            {/* New icon for main header */}
            <h1 className="text-3xl font-extrabold text-gray-800">
              System Data Overview
            </h1>
          </div>
          <p className="text-md text-gray-500 hidden sm:block">
            Comprehensive summary of core system metrics.
          </p>
        </div>
        {/* Analytics Cards Grid - Similar to your requested style */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Total Users Card */}
          <div
            className="bg-white p-6 rounded-lg shadow-md border border-gray-100
                          flex flex-col items-center justify-center text-center
                          transform transition-all duration-300 hover:scale-[1.01] hover:shadow-lg"
          >
            <Users size={40} className="text-blue-500 mb-3" />{" "}
            {/* Updated icon size and color */}
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Total Registered Users
            </h3>
            <p className="text-5xl font-bold text-gray-900 tracking-tight">
              {totalUsers}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              All active user accounts.
            </p>
          </div>

          {/* Total Tickets Card */}
          <div
            className="bg-white p-6 rounded-lg shadow-md border border-gray-100
                          flex flex-col items-center justify-center text-center
                          transform transition-all duration-300 hover:scale-[1.01] hover:shadow-lg"
          >
            <Ticket size={40} className="text-green-500 mb-3" />{" "}
            {/* Updated icon size and color */}
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Total Support Tickets
            </h3>
            <p className="text-5xl font-bold text-gray-900 tracking-tight">
              {totalTicketCount}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Sum of all tickets in the system.
            </p>
          </div>
        </section>
        {/* Footer with Last Refreshed Time */}
        <footer className="mt-8 pt-4 border-t border-gray-100 text-center text-gray-500 text-xs">
          <p>
            Data last refreshed:{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            at{" "}
            {new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            })}
          </p>
        </footer>
      </div>
    </main>
  );
}

export default DataManagementPage;
