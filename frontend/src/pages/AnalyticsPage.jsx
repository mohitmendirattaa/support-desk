import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner"; // Adjust path if needed
import {
  getTicketStatus,
  getTicketCategory,
  getTicketPriority,
  getTicketsCreatedOverTime,
  getTotalUsers,
  getTicketServiceType,
  reset, // Import the reset action
} from "../features/analytics/analyticSlice"; // Adjust path if needed

// Define a set of consistent colors for charts
const CHART_COLORS = [
  "#8884d8", // Indigo
  "#82ca9d", // Green
  "#ffc658", // Yellow
  "#FF8042", // Orange
  "#E0BBE4", // Lavender
  "#957DAD", // Plum
  "#D291BC", // Pink
  "#FFC72C", // Gold
  "#00C49F", // Teal
  "#FFBB28", // Dark Orange
];

function AnalyticsPage() {
  const dispatch = useDispatch();
  const {
    ticketsByStatus,
    ticketsByCategory,
    ticketsByPriority,
    ticketsCreatedOverTime,
    totalUsers,
    ticketsByServiceType,
    isLoading,
    isError,
    message,
  } = useSelector((state) => state.analytics);

  const { user } = useSelector((state) => state.auth); // Assuming auth slice holds user info

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (user && user.role === "admin") {
      // Fetch data only if user is an admin
      dispatch(getTicketStatus());
      dispatch(getTicketCategory());
      dispatch(getTicketPriority());
      dispatch(getTicketsCreatedOverTime("30days")); // Fetch last 30 days by default
      dispatch(getTotalUsers());
      dispatch(getTicketServiceType());
    } else {
      // Handle case where non-admin tries to access directly (though middleware should prevent)
      toast.error("You are not authorized to view this page.");
      // Optionally redirect
    }

    // Cleanup on unmount
    return () => {
      dispatch(reset());
    };
  }, [dispatch, isError, message, user]); // Added user to dependencies

  if (isLoading) {
    return <Spinner />;
  }

  // Check if user is authorized before rendering content
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Access Denied
          </h2>
          <p className="text-lg text-gray-700">
            You do not have administrative privileges to view this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="bg-gradient-to-r from-teal-600 to-cyan-700 p-6 text-white rounded-t-xl text-center">
          <h1 className="text-4xl font-extrabold mb-2">
            Advanced Analytics Dashboard
          </h1>
          <p className="text-xl opacity-90">
            Deep insights into your platform's performance and support
            operations.
          </p>
        </div>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {/* Key Performance Indicators (KPIs) */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 flex flex-col items-center justify-center text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Overall Metrics
            </h2>
            <p className="text-lg text-gray-600 mb-2">
              Total Users:{" "}
              <span className="font-semibold text-indigo-700 text-3xl">
                {totalUsers}
              </span>
            </p>
            <p className="text-lg text-gray-600 mb-2">
              Total Tickets:{" "}
              <span className="font-semibold text-blue-700 text-3xl">
                {ticketsByStatus.reduce((sum, item) => sum + item.count, 0)}
              </span>
            </p>
            {/* You could add more KPIs here */}
          </div>

          {/* Ticket Status Distribution Pie Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 flex flex-col items-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3 w-full text-center">
              Tickets by Status
            </h2>
            {ticketsByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ticketsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="name"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {ticketsByStatus.map((entry, index) => (
                      <Cell
                        key={`cell-status-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} tickets`, name]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500">No status data available.</p>
            )}
            <p className="text-gray-600 mt-4 text-center">
              Current distribution of support tickets by status.
            </p>
          </div>

          {/* Tickets by Category Bar Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 flex flex-col items-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3 w-full text-center">
              Tickets by Category
            </h2>
            {ticketsByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={ticketsByCategory}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [value, "Tickets"]} />
                  <Legend />
                  <Bar dataKey="count" fill="#06B6D4" /> {/* Cyan color */}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500">No category data available.</p>
            )}
            <p className="text-gray-600 mt-4 text-center">
              Breakdown of tickets by their main service categories.
            </p>
          </div>

          {/* Tickets Created Over Time Line Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 flex flex-col items-center col-span-1 lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3 w-full text-center">
              Ticket Creation Trend (Last 30 Days)
            </h2>
            {ticketsCreatedOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart
                  data={ticketsCreatedOverTime}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="date" interval="preserveStartEnd" />
                  <YAxis allowDecimals={false} />{" "}
                  {/* Ensures Y-axis shows whole numbers */}
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#8884d8"
                    name="New Tickets"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500">
                No trend data available for the last 30 days.
              </p>
            )}
            <p className="text-gray-600 mt-4 text-center">
              Daily volume of new tickets created over the last month.
            </p>
          </div>

          {/* Tickets by Priority Bar Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 flex flex-col items-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3 w-full text-center">
              Tickets by Priority
            </h2>
            {ticketsByPriority.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={ticketsByPriority}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [value, "Tickets"]} />
                  <Legend />
                  <Bar dataKey="count" fill="#FFC72C" /> {/* Gold color */}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500">No priority data available.</p>
            )}
            <p className="text-gray-600 mt-4 text-center">
              Count of tickets categorized by their urgency level.
            </p>
          </div>

          {/* Tickets by Service Type Pie Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 flex flex-col items-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3 w-full text-center">
              Tickets by Service Type
            </h2>
            {ticketsByServiceType.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ticketsByServiceType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="name"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {ticketsByServiceType.map((entry, index) => (
                      <Cell
                        key={`cell-service-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} tickets`, name]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500">No service type data available.</p>
            )}
            <p className="text-gray-600 mt-4 text-center">
              Breakdown of tickets based on the type of service requested.
            </p>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-200 text-center rounded-b-xl">
          <p className="text-gray-600">
            Data refreshed: {new Date().toLocaleDateString()}{" "}
            {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;
