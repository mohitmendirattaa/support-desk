// frontend/src/components/AdvancedLogSearchModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { X, CalendarCheck, Search, User } from "lucide-react";

function AdvancedLogSearchModal({
  isOpen,
  onClose,
  onSearch,
  initialSearchCriteria,
}) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [userId, setUserId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const modalRef = useRef(null);

  // Synchronize local state with initial search criteria when modal opens or criteria changes
  useEffect(() => {
    if (isOpen) {
      setFromDate(initialSearchCriteria.from || "");
      setToDate(initialSearchCriteria.to || "");
      setUserId(initialSearchCriteria.userId || "");
      setErrorMessage(""); // Clear any previous error messages when opening
    }
  }, [isOpen, initialSearchCriteria]);

  // Handle escape key to close modal and focus management for accessibility
  useEffect(() => {
    if (isOpen) {
      modalRef.current?.focus(); // Focus the modal container
      const handleEscape = (event) => {
        if (event.key === "Escape") {
          onClose();
        }
      };
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [isOpen, onClose]);

  // If modal is not open, don't render anything
  if (!isOpen) return null;

  // --- Handlers for form actions ---
  const handleApplyFilters = () => {
    setErrorMessage(""); // Reset error message

    const isDateRangeSelected = fromDate && toDate;
    const isUserIdSelected = userId.trim() !== "";

    // Validation: Require at least one search type
    if (!isDateRangeSelected && !isUserIdSelected) {
      setErrorMessage("Please enter a Date Range or a User ID to search.");
      return;
    }

    // Validation: Cannot search by both
    if (isDateRangeSelected && isUserIdSelected) {
      setErrorMessage(
        "Please search by either Date Range OR User ID, not both simultaneously."
      );
      return;
    }

    // Validation: Date range order
    if (isDateRangeSelected && new Date(fromDate) > new Date(toDate)) {
      setErrorMessage("From Date cannot be after To Date.");
      return;
    }

    // Pass the valid search criteria to the parent component
    onSearch({ from: fromDate, to: toDate, userId: userId.trim() });
    onClose(); // Close modal on successful search
  };

  const handleClearFilters = () => {
    setFromDate("");
    setToDate("");
    setUserId("");
    setErrorMessage("");
    onSearch({}); // Notify parent to clear all filters
    onClose(); // Close modal
  };

  return (
    // Simple Backdrop overlay: fixed, full screen, dark background, centered content
    <div
      className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50 p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="advanced-log-search-title"
      tabIndex="-1" // Make the div focusable
      ref={modalRef} // Assign ref
      onClick={(e) => {
        // Close modal if backdrop is clicked
        if (e.target === modalRef.current) {
          onClose();
        }
      }}
    >
      {/* Simple Modal content container: white background, rounded corners, shadow, padding, max width */}
      <div
        className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing modal
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          aria-label="Close advanced log search modal"
        >
          <X size={24} strokeWidth={2} />
        </button>

        {/* Modal Title */}
        <h2
          id="advanced-log-search-title"
          className="text-2xl font-extrabold text-gray-900 mb-7 flex items-center border-b pb-4 border-gray-200"
        >
          <Search size={32} className="mr-3 text-blue-600" /> Advanced Log
          Search
        </h2>

        {/* Error Message Display */}
        {errorMessage && (
          <div
            className="bg-red-50 border border-red-300 text-red-700 px-5 py-3 rounded-lg relative mb-6 text-sm"
            role="alert"
          >
            <strong className="font-semibold">Error:</strong>{" "}
            <span className="block sm:inline">{errorMessage}</span>
          </div>
        )}

        {/* Search Fields */}
        <div className="space-y-6">
          {/* Date Range Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <CalendarCheck size={20} className="mr-2 text-blue-500" /> Search
              by Date Range
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="from-date"
                  className="block text-sm font-medium text-gray-800 mb-2"
                >
                  From Date:
                </label>
                <input
                  type="date"
                  id="from-date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="to-date"
                  className="block text-sm font-medium text-gray-800 mb-2"
                >
                  To Date:
                </label>
                <input
                  type="date"
                  id="to-date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Separator */}
          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-600 font-medium">
              OR
            </span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* User ID Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <User size={20} className="mr-2 text-blue-500" /> Search by User
              ID
            </h3>
            <input
              type="text"
              id="user-id"
              placeholder="Enter User ID (e.g., GUID or email)"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-8">
          <button
            onClick={handleClearFilters}
            className="px-6 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Clear Filters
          </button>
          <button
            onClick={handleApplyFilters}
            className="px-6 py-2.5 border border-transparent rounded-lg shadow-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdvancedLogSearchModal;
