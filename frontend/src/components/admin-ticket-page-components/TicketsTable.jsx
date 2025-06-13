// src/components/TicketsTable.jsx
import React from "react";
import AdminTicketItem from "./AdminTicketItem";

// UserIcon will be passed as a prop from TicketsPage
function TicketsTable({ currentTickets, UserIcon }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-indigo-600 text-white">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider rounded-tl-lg"
            >
              Ticket ID
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
            >
              Category
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
            >
              Sub-Category
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
            >
              Priority
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider flex items-center"
            >
              <UserIcon className="mr-1 w-4 h-4" /> Raised By
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider rounded-tr-lg"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {currentTickets.map((ticket) => (
            <AdminTicketItem key={ticket.id} ticket={ticket} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TicketsTable;
