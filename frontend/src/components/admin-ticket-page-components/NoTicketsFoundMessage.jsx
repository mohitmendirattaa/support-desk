// src/components/admin-ticket-page-components/NoTicketsFoundMessage.jsx
import React from "react";
import { TicketIcon } from "./Icons"; // Ensure this path is correct

function NoTicketsFoundMessage({ searchTerm }) {
  return (
    <div className="text-center py-10">
      <TicketIcon className="text-gray-400 w-24 h-24 mx-auto mb-6" />
      <p className="text-2xl text-gray-700 font-semibold">
        {searchTerm
          ? "No tickets found matching your search."
          : "No tickets found."}
      </p>
      {!searchTerm && (
        <p className="text-md text-gray-500 mt-2">
          It seems no tickets have been raised yet.
        </p>
      )}
    </div>
  );
}

export default NoTicketsFoundMessage;
