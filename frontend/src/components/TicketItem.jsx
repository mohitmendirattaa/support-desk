// src/components/TicketItem.jsx
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
    <div className="grid grid-cols-1 md:grid-cols-7 gap-4 p-4 lg:p-6 hover:bg-gray-50 transition-colors cursor-pointer items-center border-b border-gray-100 last:border-b-0">
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
          to={`/ticket/${ticket._id}`}
        >
          View Details
        </Link>
      </div>

      <div className="md:hidden col-span-full border-t border-gray-100 pt-4 mt-4">
        <h3 className="text-lg font-bold text-blue-800 mb-2">Ticket Summary</h3>
        <p className="text-gray-700 mb-1">
          <strong className="font-semibold">Priority:</strong> {ticket.priority}
        </p>
        <p className="text-gray-700 mb-1">
          <strong className="font-semibold">Category:</strong> {ticket.category}
        </p>
        <p className="text-gray-700 mb-1">
          <strong className="font-semibold">Sub-Category:</strong>{" "}
          {ticket.subCategory}
        </p>
        <p className="text-gray-700 mb-1">
          <strong className="font-semibold">Start Date:</strong>{" "}
          {new Date(ticket.startDate).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
        <p className="text-gray-700 mb-1">
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
          <p className="text-gray-700 mb-1">
            <strong className="font-semibold">Description:</strong>{" "}
            {ticket.description.substring(0, 70)}...
          </p>
        )}
        <div className="mt-4">
          <Link
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors text-sm font-semibold whitespace-nowrap"
            to={`/ticket/${ticket._id}`}
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

export default TicketItem;
