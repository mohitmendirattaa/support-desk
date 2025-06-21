// components/Modal.jsx
import React from "react";

const Modal = ({ show, onClose, children }) => {
  if (!show) {
    return null;
  }

  return (
    // Add onClick={onClose} here
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full relative transform transition-all duration-300 scale-100 opacity-100"
        onClick={(e) => e.stopPropagation()} // Keep this to prevent closing when clicking *inside* modal
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
