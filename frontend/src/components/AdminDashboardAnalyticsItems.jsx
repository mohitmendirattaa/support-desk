import React from "react";
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
import { LayoutDashboard,  Ticket, BarChart2 } from "lucide-react"; // Users

const CHART_COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#FF8042",
  "#E0BBE4",
  "#957DAD",
  "#D291BC",
  "#FFC72C",
  "#00C49F",
  "#FFBB28",
];

function AdminDashboardAnalyticsItems({
  ticketsByStatus = [],
  ticketsByCategory = [],
  ticketsByPriority = [],
  ticketsCreatedOverTime = [],
  totalUsers = 0,
  ticketsByServiceType = [],
}) {
  const totalTickets = ticketsByStatus.reduce(
    (sum, item) => sum + item.count,
    0
  );

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 mb-4">
          Dashboard Overview & Analytics Summary
        </h1>
        <p className="text-lg text-gray-600">
          Welcome to your control panel. Here's a quick look at key performance
          indicators and primary trends.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-100 p-6 rounded-lg shadow-md text-blue-800 flex flex-col items-center">
          <LayoutDashboard size={32} className="mb-3" />
          <h3 className="text-2xl font-bold mb-2">Total Users</h3>
          <p className="text-4xl font-extrabold">{totalUsers}</p>
          <p className="text-sm opacity-80 mt-2">Overall registered users</p>
        </div>
        <div className="bg-green-100 p-6 rounded-lg shadow-md text-green-800 flex flex-col items-center">
          <Ticket size={32} className="mb-3" />
          <h3 className="text-2xl font-bold mb-2">Total Tickets</h3>
          <p className="text-4xl font-extrabold">{totalTickets}</p>
          <p className="text-sm opacity-80 mt-2">All tickets in the system</p>
        </div>
        <div className="bg-yellow-100 p-6 rounded-lg shadow-md text-yellow-800 flex flex-col items-center">
          <Ticket size={32} className="mb-3" />
          <h3 className="text-2xl font-bold mb-2">Open Tickets</h3>
          <p className="text-4xl font-extrabold">
            {ticketsByStatus.find((s) => s.name === "Open")?.count || 0}
          </p>
          <p className="text-sm opacity-80 mt-2">
            Currently unresolved tickets
          </p>
        </div>
        <div className="bg-purple-100 p-6 rounded-lg shadow-md text-purple-800 flex flex-col items-center">
          <BarChart2 size={32} className="mb-3" />
          <h3 className="text-2xl font-bold mb-2">Avg. Resolution Time</h3>
          <p className="text-4xl font-extrabold">--</p>
          <p className="text-sm opacity-80 mt-2">Data not available</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
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
                <Bar dataKey="count" fill="#06B6D4" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No category data available.</p>
          )}
          <p className="text-gray-600 mt-4 text-center">
            Breakdown of tickets by their main service categories.
          </p>
        </div>

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
                <CartesianGrid strokeDashDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value, name) => [value, "Tickets"]} />
                <Legend />
                <Bar dataKey="count" fill="#FFC72C" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No priority data available.</p>
          )}
          <p className="text-gray-600 mt-4 text-center">
            Count of tickets categorized by their urgency level.
          </p>
        </div>

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
                <YAxis allowDecimals={false} />
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
      </div>

      <div className="p-6 bg-gray-50 border-t border-gray-200 text-center rounded-b-xl">
        <p className="text-gray-600">
          Data refreshed: {new Date().toLocaleDateString()}{" "}
          {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}

export default AdminDashboardAnalyticsItems;
