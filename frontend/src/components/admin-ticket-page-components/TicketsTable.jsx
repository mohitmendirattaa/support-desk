// src/components/admin-ticket-page-components/TicketsTable.jsx
import React from "react";
import AdminTicketItem from "./AdminTicketItem"; // Ensure this path is correct

/**
 * @param {Object} props - Component props
 * @param {Array<Object>} props.currentTickets - Array of ticket data for the current page
 * @param {React.ComponentType} props.UserIcon - The UserIcon component
 * @param {function(string): void} props.onDelete - Callback for individual ticket deletion
 * @param {Set<string>} props.selectedTicketIds - A Set of currently selected ticket IDs
 * @param {function(string, boolean): void} props.onSelectTicket - Callback to toggle selection of a single ticket
 * @param {function(boolean): void} props.onSelectAllTickets - Callback to select/deselect all tickets on the current page
 */
function TicketsTable({
  currentTickets,
  UserIcon,
  onDelete,
  selectedTicketIds, // This prop might be undefined
  onSelectTicket,
  onSelectAllTickets,
}) {
  // Defensive check: Ensure selectedTicketIds is a Set, default to empty Set if not provided or undefined
  const safeSelectedTicketIds =
    selectedTicketIds instanceof Set ? selectedTicketIds : new Set();
  const isAllSelected =
    currentTickets.length > 0 &&
    currentTickets.every((ticket) => safeSelectedTicketIds.has(ticket.id));

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-indigo-600 text-white">
          <tr>
            {/* Select All Checkbox Column */}
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider rounded-tl-lg"
            >
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={(e) => onSelectAllTickets(e.target.checked)}
                className="form-checkbox h-4 w-4 text-indigo-200 transition duration-150 ease-in-out rounded focus:ring-indigo-300"
              />
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
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
            <AdminTicketItem
              key={ticket.id}
              ticket={ticket}
              onDelete={onDelete}
              // Pass the safeSelectedTicketIds for checking selection status
              isSelected={safeSelectedTicketIds.has(ticket.id)}
              onSelect={onSelectTicket} // Pass selection handler
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TicketsTable;
