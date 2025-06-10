import React from "react";
import { Link } from "react-router-dom";

function TicketItem({ ticket }) {
  const getStatusClasses = (status) => {
    switch (status) {
      case "new":
        return "bg-blue-600 text-white";
      case "open":
        return "bg-blue-700 text-white";
      case "closed":
        return "bg-red-700 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    // Changed 'p-4 lg:p-6' to 'p-3 lg:p-4' to reduce row height
    <div className="grid grid-cols-1 md:grid-cols-7 gap-4 p-3 lg:p-4 hover:bg-gray-50 transition-colors cursor-pointer items-center border-b border-gray-100 last:border-b-0">
      <div className="hidden md:block text-gray-800 font-medium">
        {ticket.priority || "N/A"}
      </div>

      <div className="hidden md:block text-gray-600 text-sm">
        {new Date(ticket.startDate).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </div>

      <div className="hidden md:block text-gray-600 text-sm">
        {ticket.endDate
          ? new Date(ticket.endDate).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "N/A"}
      </div>

      <div className="hidden md:block text-gray-800 font-medium">
        {ticket.category || "N/A"}
      </div>

      <div className="hidden md:block text-gray-600">
        {ticket.subCategory || "N/A"}
      </div>

      <div className="flex justify-center items-center">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusClasses(
            ticket.status
          )}`}
        >
          {ticket.status}
        </span>
      </div>

      <div className="flex justify-end md:justify-start">
        <Link
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors text-sm font-semibold whitespace-nowrap"
          to={`/tickets/${ticket.id}`}
        >
          View Details
        </Link>
      </div>

      {/* Mobile view adjustments - also reduced vertical padding here */}
      <div className="md:hidden col-span-full border-t border-gray-100 pt-3 mt-3">
        {" "}
        {/* Changed pt-4 mt-4 to pt-3 mt-3 */}
        <h3 className="text-lg font-bold text-blue-800 mb-1">
          Ticket Summary
        </h3>{" "}
        {/* Adjusted mb-2 to mb-1 */}
        <p className="text-gray-700 text-sm mb-0.5">
          {" "}
          {/* Added text-sm and adjusted mb-1 to mb-0.5 */}
          <strong className="font-semibold">Priority:</strong> {ticket.priority}
        </p>
        <p className="text-gray-700 text-sm mb-0.5">
          <strong className="font-semibold">Category:</strong> {ticket.category}
        </p>
        <p className="text-gray-700 text-sm mb-0.5">
          <strong className="font-semibold">Sub-Category:</strong>{" "}
          {ticket.subCategory}
        </p>
        <p className="text-gray-700 text-sm mb-0.5">
          <strong className="font-semibold">Start Date:</strong>{" "}
          {new Date(ticket.startDate).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
        <p className="text-gray-700 text-sm mb-0.5">
          <strong className="font-semibold">Target Resolution:</strong>{" "}
          {ticket.endDate
            ? new Date(ticket.endDate).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "N/A"}
        </p>
        {ticket.description && (
          <p className="text-gray-700 text-sm mb-0.5">
            <strong className="font-semibold">Description:</strong>{" "}
            {ticket.description.substring(0, 70)}...
          </p>
        )}
        <div className="mt-3">
          {" "}
          {/* Changed mt-4 to mt-3 */}
          <Link
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors text-sm font-semibold whitespace-nowrap"
            to={`/tickets/${ticket.id}`}
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

export default TicketItem;
