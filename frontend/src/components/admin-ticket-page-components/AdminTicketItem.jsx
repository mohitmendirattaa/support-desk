// src/components/AdminTicketItem.jsx
import React from "react";
import { Link } from "react-router-dom"; // Import Link for navigation
import { Trash2 } from "lucide-react"; // Import Trash2 icon for delete

/**
 * @param {Object} props - Component props
 * @param {Object} props.ticket - The ticket data object
 * @param {function(string): void} props.onDelete - Callback function to handle individual ticket deletion, takes ticket ID as argument
 * @param {boolean} props.isSelected - Indicates if the current ticket is selected
 * @param {function(string, boolean): void} props.onSelect - Callback function to handle ticket selection (ID, isChecked)
 */
function AdminTicketItem({ ticket, onDelete, isSelected, onSelect }) {
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
      {/* Checkbox Column */}
      <td className="px-4 py-1.5 whitespace-nowrap text-sm text-gray-900">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(ticket.id, e.target.checked)}
          className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out rounded focus:ring-indigo-500"
        />
      </td>
      {/* Ticket ID */}
      <td className="px-4 py-1.5 whitespace-nowrap text-sm font-medium text-gray-900">
    
        {ticket.id || "N/A"}
      </td>
      {/* Category */}
      <td className="px-6 py-1.5 whitespace-nowrap text-sm text-gray-600">
        {" "}
        {/* Changed py-4 to py-1.5 */}
        {ticket.category}
      </td>
      {/* Sub-Category */}
      <td className="px-6 py-1.5 whitespace-nowrap text-sm text-gray-600">
        {" "}
        {/* Changed py-4 to py-1.5 */}
        {ticket.subCategory}
      </td>
      {/* Status */}
      <td className="px-6 py-1.5 whitespace-nowrap">
        {" "}
        {/* Changed py-4 to py-1.5 */}
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
            ticket.status
          )}`}
        >
          {ticket.status}
        </span>
      </td>
      {/* Priority */}
      <td className="px-6 py-1.5 whitespace-nowrap">
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityClass(
            ticket.priority
          )}`}
        >
          {ticket.priority}
        </span>
      </td>
      {/* Raised By User */}
      <td className="px-6 py-1.5 whitespace-nowrap text-sm text-gray-600">
        {" "}
        {/* Changed py-4 to py-1.5 */}
        {ticket.user ? ticket.user.name : "N/A"}
      </td>
      {/* Actions */}
      <td className="px-6 py-1.5 whitespace-nowrap text-sm font-medium">
        {" "}
        {/* Changed py-4 to py-1.5 */}
        <div className="flex space-x-2">
          {/* View Details Link */}
          <Link
            to={`/admin-dashboard/tickets/${ticket.id}`} // Link to the single ticket view using its ID
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
          >
            View Details
          </Link>
          {/* Individual Delete Button (Icon Only) - Conditional Rendering */}
          {isSelected && (
            <button
              onClick={() => onDelete(ticket.id)} // Pass ticket.id to the onDelete handler
              className="inline-flex items-center p-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
              title="Delete Ticket" // Added a title for accessibility
            >
              <Trash2 size={16} /> {/* Icon only */}
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export default AdminTicketItem;
