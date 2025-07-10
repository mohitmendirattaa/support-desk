// src/components/admin-ticket-page-components/AdvancedSearchModal.jsx
import React, { useState, useEffect } from "react";
import { X, CalendarCheck } from "lucide-react"; // Import icons

function AdvancedSearchModal({ isOpen, onClose, onSearch, initialDateRange }) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Effect to update local state when initialDateRange changes (e.g., when opening modal with pre-filled dates)
  useEffect(() => {
    if (initialDateRange) {
      setFromDate(initialDateRange.from);
      setToDate(initialDateRange.to);
    }
  }, [initialDateRange]);

  if (!isOpen) return null;

  const handleGo = () => {
    // Basic validation: ensure 'from' date is not after 'to' date
    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      alert("From date cannot be after To date.");
      return;
    }
    onSearch({ from: fromDate, to: toDate });
  };

  const handleClear = () => {
    setFromDate("");
    setToDate("");
    onSearch({ from: "", to: "" }); // Clear search in parent
    onClose(); // Close modal
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <CalendarCheck size={28} className="mr-2 text-blue-600" /> Advanced
          Date Search
        </h2>

        <div className="mb-4">
          <label
            htmlFor="from-date"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            From Date:
          </label>
          <input
            type="date"
            id="from-date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="to-date"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            To Date:
          </label>
          <input
            type="date"
            id="to-date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={handleClear}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Clear Search
          </button>
          <button
            onClick={handleGo}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdvancedSearchModal;
