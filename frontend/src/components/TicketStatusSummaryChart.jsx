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
  LineChart, // ADDED: For Line Chart
  Line, // ADDED: For Line Chart
} from "recharts";
import { Ticket } from "lucide-react";

// Define specific colors for the statuses you want to highlight on the chart
const STATUS_COLORS = {
  Open: "#3B82F6",
  Pending: "#F59E0B",
  Hold: "#EF4444",
  Closed: "#F97316",
  Reopened: "#06B6D4",
  Resolved: "#22C55E",
  DEFAULT: "#CCCCCC",
};

// Define how your database statuses map to the display names for the chart AND summary boxes
const STATUS_MAP = {
  new: "Open",
  pending: "Pending",
  hold: "Hold",
  closed: "Closed",
  resolved: "Resolved", // CHANGED: Now maps to 'Resolved'
  reopened: "Reopened",
};

// ADDED: Colors for Line Chart lines if you have multiple
const LINE_COLORS = {
  created: "#8884d8", // Purple
  resolved: "#82ca9d", // Green (Example if you add resolved tickets over time)
};

// ADDED new props: ticketsCreatedOverTimeData, onTimeframeChange, selectedTimeframe
function TicketStatusSummaryChart({
  ticketsByStatusData,
  ticketsCreatedOverTimeData, // NEW PROP for Line Chart
  onTimeframeChange, // NEW PROP for timeframe buttons
  selectedTimeframe, // NEW PROP to highlight active timeframe button
}) {
  const processedData = ticketsByStatusData.reduce((acc, item) => {
    const dbStatusLower = item.name.toLowerCase();

    let displayName = item.name;
    const mappedEntry = Object.entries(STATUS_MAP).find(
      ([key]) => key.toLowerCase() === dbStatusLower
    );
    if (mappedEntry) {
      displayName = mappedEntry[1];
    } else {
      displayName =
        dbStatusLower.charAt(0).toUpperCase() + dbStatusLower.slice(1);
    }

    const existingEntry = acc.find((entry) => entry.name === displayName);
    if (existingEntry) {
      existingEntry.count += item.count;
    } else {
      acc.push({ name: displayName, count: item.count });
    }
    return acc;
  }, []);

  const getMappedTicketCount = (statusName) => {
    const found = processedData.find((s) => s.name === statusName);
    return found ? found.count : 0;
  };

  const openTicketsCount = getMappedTicketCount("Open");
  const pendingTicketsCount = getMappedTicketCount("Pending");
  const holdTicketsCount = getMappedTicketCount("Hold");
  const closedTicketsCount = getMappedTicketCount("Closed");
  const resolvedTicketsCount = getMappedTicketCount("Resolved"); // NEW: Get resolved count
  const reopenedTicketsCount = getMappedTicketCount("Reopened");

  const finalChartData = processedData.filter(
    (item) =>
      item.name === "Open" ||
      item.name === "Pending" ||
      item.name === "Hold" ||
      item.name === "Closed" ||
      item.name === "Resolved" ||
      item.name === "Reopened"
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 flex flex-col items-center">
     {/* <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3 w-full text-center">
        Ticket Status Overview
      </h2> */}

      {/* Summary Cards for Open, Pending, Hold, Closed, Reopened, RESOLVED */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 w-full mb-6">
        {" "}
        {/* Adjusted grid-cols-6 */}
        <div className="bg-blue-500 p-4 rounded-lg shadow-sm text-black-800 flex flex-col items-center text-center">
          <Ticket size={24} className="mb-2" />
          <h3 className="text-xl font-bold">{openTicketsCount}</h3>
          <p className="text-sm">Open Tickets</p>
        </div>
        <div className="bg-yellow-500 p-4 rounded-lg shadow-sm text-black-800 flex flex-col items-center text-center">
          <Ticket size={24} className="mb-2" />
          <h3 className="text-xl font-bold">{pendingTicketsCount}</h3>
          <p className="text-sm">Pending Tickets</p>
        </div>
        <div className="bg-red-500 p-4 rounded-lg shadow-sm text-black-800 flex flex-col items-center text-center">
          <Ticket size={24} className="mb-2" />
          <h3 className="text-xl font-bold">{holdTicketsCount}</h3>
          <p className="text-sm">Hold Tickets</p>
        </div>
        <div className="bg-orange-500 p-4 rounded-lg shadow-sm text-black-800 flex flex-col items-center text-center">
          <Ticket size={24} className="mb-2" />
          <h3 className="text-xl font-bold">{closedTicketsCount}</h3>
          <p className="text-sm">Closed Tickets</p>
        </div>
        {/* NEW: Resolved Tickets Card */}
        <div className="bg-green-500 p-4 rounded-lg shadow-sm text-black-800 flex flex-col items-center text-center">
          <Ticket size={24} className="mb-2" />
          <h3 className="text-xl font-bold">{resolvedTicketsCount}</h3>
          <p className="text-sm">Resolved Tickets</p>
        </div>
        {/* END NEW: Resolved Tickets Card */}
        <div className="bg-cyan-500 p-4 rounded-lg shadow-sm text-black-800 flex flex-col items-center text-center">
          <Ticket size={24} className="mb-2" />
          <h3 className="text-xl font-bold">{reopenedTicketsCount}</h3>
          <p className="text-sm">Reopened Tickets</p>
        </div>
      </div>
      {/* END Summary Cards */}

      {/* Charts Section */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Pie Chart Section */}
        <div className="chart-container bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">
            Status Distribution (Pie Chart)
          </h3>
          {finalChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={finalChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  dataKey="count"
                  nameKey="name"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {finalChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[entry.name] || STATUS_COLORS.DEFAULT}
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
            <p className="text-gray-500 text-center">No data for Pie Chart.</p>
          )}
        </div>

        {/* Bar Chart Section */}
        <div className="chart-container bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">
            Tickets by Status (Bar Chart)
          </h3>
          {finalChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={finalChartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${value} tickets`} />
                <Legend />
                <Bar dataKey="count" name="Tickets" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center">No data for Bar Chart.</p>
          )}
        </div>
      </div>

      {/* Line Chart Section */}
      <div className="w-full mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">
          Tickets Created Over Time (Line Chart)
        </h3>
        {/* Timeframe Selector */}
        <div className="flex justify-center gap-4 mb-4">
          <button
            onClick={() => onTimeframeChange("7days")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              selectedTimeframe === "7days"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => onTimeframeChange("30days")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              selectedTimeframe === "30days"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => onTimeframeChange("90days")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              selectedTimeframe === "90days"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Last 90 Days
          </button>
          <button
            onClick={() => onTimeframeChange("year")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              selectedTimeframe === "year"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Last Year
          </button>
        </div>

        {ticketsCreatedOverTimeData && ticketsCreatedOverTimeData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={ticketsCreatedOverTimeData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                labelFormatter={(label) => `Date: ${label}`}
                formatter={(value) => `${value} tickets`}
              />
              <Legend />
              {/* If your backend sends {date, count}, use this */}
              <Line
                type="monotone"
                dataKey="count"
                stroke={LINE_COLORS.created}
                name="Tickets Created"
                activeDot={{ r: 8 }}
              />
              {/* If your backend also sends "resolved" counts for the same date, you could add another line like this: */}
              {/* <Line type="monotone" dataKey="resolved" stroke={LINE_COLORS.resolved} name="Tickets Resolved" activeDot={{ r: 8 }} /> */}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center">
            No data for Line Chart for the selected timeframe.
          </p>
        )}
      </div>

      <p className="text-gray-600 mt-4 text-center">
        A quick overview of tickets in critical workflow stages.
      </p>
    </div>
  );
}

export default TicketStatusSummaryChart;
