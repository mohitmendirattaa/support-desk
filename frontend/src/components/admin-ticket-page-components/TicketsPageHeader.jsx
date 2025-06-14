// src/components/admin-ticket-page-components/TicketsPageHeader.jsx
import React from "react";
import { TicketIcon } from "./Icons"// Ensure this path is correct

function TicketsPageHeader({ TicketIcon }) {
  return (
    <header className="flex flex-col sm:flex-row items-center justify-between mb-4 pb-2 border-b border-gray-200">
      <h1 className="text-4xl font-extrabold text-indigo-700 flex items-center mb-4 sm:mb-0">
        <TicketIcon className="mr-3 w-10 h-10 text-indigo-500" /> All Tickets
        (Admin View)
      </h1>
      <p className="text-lg text-gray-600">
        Overview of all user-generated tickets.
      </p>
    </header>
  );
}

export default TicketsPageHeader;
