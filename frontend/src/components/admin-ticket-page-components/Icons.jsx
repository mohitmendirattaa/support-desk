// src/components/Icons.jsx
import React from "react";

export const TicketIcon = ({ className }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      d="M14.5 3.235V3h-.104c-1.425 0-2.852.124-4.276.368-1.417.243-2.834.61-4.238 1.13-1.4.52-2.784 1.18-4.148 1.95V3h-.104C1.942 3 1 3.942 1 5.096V17h18V5.096c0-1.154-.942-2.096-2.096-2.096zM3 15V7.473c1.077-.423 2.18-.756 3.308-.99 1.127-.234 2.26-.35 3.39-.35h.004c1.13 0 2.263.116 3.39.35 1.128.234 2.231.567 3.308.99V15H3zM15 11.5a.5.5 0 01-.5.5h-9a.5.5 0 010-1h9a.5.5 0 01.5.5z"
      clipRule="evenodd"
    ></path>
  </svg>
);

export const UserIcon = ({ className }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
      clipRule="evenodd"
    ></path>
  </svg>
);
