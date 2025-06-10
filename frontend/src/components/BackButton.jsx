import React from "react";
import { FaArrowCircleLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function BackButton() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      // Added 'relative' and 'overflow-hidden' for the spread effect.
      // Removed 'transform hover:scale-105' from here as the inner element handles the animation.
      className="relative inline-flex items-center justify-center // Added justify-center to center content horizontally
                 px-6 py-2.5
                 mt-4 mb-4
                 bg-white text-gray-800 // Base text color
                 border border-gray-200 rounded-full
                 shadow-md // Moderate shadow
                 font-semibold text-base
                 overflow-hidden // Hides the expanding part of the inner span
                 transition-all duration-300 ease-in-out // Smooth transition for base button properties
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50
                 group // Add 'group' class to allow 'group-hover' on child elements
      "
    >
      {/* Spreading color element - positioned absolutely behind the content */}
      <span
        className="absolute inset-0 // Position over the entire button area
                   bg-blue-500 // The color that will spread
                   transform scale-0 rounded-full // Starts as a tiny, hidden circle
                   group-hover:scale-[2] // Scales up significantly to cover the button on hover
                   group-hover:opacity-100 // Becomes fully opaque on hover
                   transition-all duration-500 ease-out // Smooth transition for the spread
                   opacity-0 // Initially hidden
                   z-0 // Ensures it's behind the text content
      "
      ></span>

      {/* Button content (icon and text) - ensure it's above the spreading element */}
      {/* Removed 'group-hover:text-white' so the text color does not change on hover */}
      <span className="relative z-10 flex items-center transition-colors duration-300">
        <FaArrowCircleLeft className="mr-2 text-lg" /> Back
      </span>
    </button>
  );
}

export default BackButton;
