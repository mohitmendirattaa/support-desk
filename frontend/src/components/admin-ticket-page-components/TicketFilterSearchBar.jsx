import React from "react";
import { Search } from "lucide-react"; // Import Search icon

function TicketFilterSearchBar({ searchTerm, onSearchChange, onClearSearch }) {
  return (
    <div className="mb-6 flex items-center space-x-3">
      <div className="relative flex-1">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Search by Ticket ID..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out text-gray-700 placeholder-gray-400"
        />
      </div>

      {searchTerm && (
        <button
          onClick={onClearSearch}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-150 ease-in-out"
        >
          Clear
        </button>
      )}
    </div>
  );
}

export default TicketFilterSearchBar;
