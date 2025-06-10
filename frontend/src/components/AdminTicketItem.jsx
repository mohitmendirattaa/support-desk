import React from "react";
import { Link } from "react-router-dom"; // Import Link for navigation

function AdminTicketItem({ ticket }) {
  // Helper to determine status badge styling
  const getStatusClass = (status) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "open":
        return "bg-yellow-100 text-yellow-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-purple-100 text-purple-800"; // Fallback for unknown status
    }
  };

  // Helper to determine priority badge styling
  const getPriorityClass = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-orange-100 text-orange-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-blue-100 text-blue-800"; // Fallback for unknown priority
    }
  };

  return (
    <tr className="hover:bg-gray-50 transition duration-150 ease-in-out">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {ticket.id || "N/A"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
        {ticket.category}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
        {ticket.subCategory}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
            ticket.status
          )}`}
        >
          {ticket.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityClass(
            ticket.priority
          )}`}
        >
          {ticket.priority}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
        {ticket.user ? ticket.user.name : "N/A"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        {/* Changed from button to Link component */}
        <Link
          to={`/admin-dashboard/tickets/${ticket.id}`} // Link to the single ticket view using its ID
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
        >
          View Details
        </Link>
      </td>
    </tr>
  );
}

export default AdminTicketItem;
