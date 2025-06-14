// src/components/DeleteConfirmationModal.jsx
import React from "react";
import { Trash2, X } from "lucide-react"; // Import X icon for close button

/**
 * A reusable modal component for confirming deletion.
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Controls the visibility of the modal.
 * @param {function(): void} props.onClose - Callback to close the modal.
 * @param {function(): void} props.onConfirm - Callback to confirm the deletion.
 * @param {number} props.count - The number of items to be deleted.
 */
function DeleteConfirmationModal({ isOpen, onClose, onConfirm, count }) {
  if (!isOpen) return null; // Don't render if not open

  const isBulkDelete = count > 1;
  const message = isBulkDelete
    ? `Are you sure you want to delete ${count} selected ticket(s)?`
    : `Are you sure you want to delete this ticket?`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none bg-gray-900 bg-opacity-75 transition-opacity duration-300 ease-out">
      <div className="relative w-auto my-6 mx-auto max-w-lg p-6 bg-white rounded-lg shadow-xl transform transition-transform duration-300 ease-out scale-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-4">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center">
            <Trash2 className="text-red-500 mr-2" size={24} /> Confirm Deletion
          </h3>
          <button
            className="p-1 leading-none outline-none focus:outline-none text-gray-500 hover:text-gray-700 transition-colors duration-150"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="relative p-2 flex-auto">
          <p className="text-lg text-gray-600 leading-relaxed text-center">
            {message}
          </p>
          <p className="text-md text-gray-500 mt-2 text-center">
            This action cannot be undone.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-4 border-t border-gray-200 mt-4 space-x-3">
          <button
            className="px-6 py-2.5 rounded-md text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all duration-150 ease-in-out shadow-sm"
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-6 py-2.5 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-150 ease-in-out shadow-sm"
            type="button"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmationModal;
