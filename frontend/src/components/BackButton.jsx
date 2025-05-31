// src/components/BackButton.jsx
import React from "react";
import { FaArrowCircleLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function BackButton() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      className="inline-flex items-center px-5 py-2 mt-4 mb-4 // Added vertical margin for spacing
                 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg shadow-sm
                 font-semibold text-base
                 hover:bg-gray-200 hover:border-gray-400 hover:text-gray-800
                 transition-all duration-200 ease-in-out
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      <FaArrowCircleLeft className="mr-2 text-lg" /> Back
    </button>
  );
}

export default BackButton;
