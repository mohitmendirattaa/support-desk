// frontend/src/pages/SystemSetting.jsx

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLogs, resetLogs } from "../features/logs/logSlice";
import {
  FaSyncAlt, // For refresh button
  FaSignInAlt, // For Login action
  FaSignOutAlt, // For Logout action
  FaExclamationTriangle, // For WARN
  FaTimesCircle, // For ERROR
  FaInfoCircle, // For INFO
  FaBug, // For DEBUG
  FaTicketAlt, // For CREATE_TICKET / UPDATE_TICKET
  FaEye, // For VIEW_REPORT
  FaUserCircle, // Generic user icon, if needed
  FaSpinner, // For loading state
  FaExclamationCircle, // For error message
  FaClipboardList, // For no logs found
  FaCogs, // For general settings/system log icon
} from "react-icons/fa"; // Import necessary React Icons

const SystemSetting = () => {
  const dispatch = useDispatch();
  const { logs, isLoadingLogs, isErrorLogs, messageLogs } = useSelector(
    (state) => state.logs
  );

  // Fetch logs on component mount
  useEffect(() => {
    dispatch(fetchLogs());

    // Cleanup function: reset logs state on component unmount
    return () => {
      dispatch(resetLogs());
    };
  }, [dispatch]);

  // Helper function to determine text color and icon based on log Action
  const getLogDetails = (action) => {
    let colorClass = "text-gray-800";
    let IconComponent = FaCogs; // Default icon

    switch (action) {
      case "ERROR":
        colorClass = "text-red-600 font-bold";
        IconComponent = FaTimesCircle;
        break;
      case "WARN":
        colorClass = "text-yellow-600 font-bold";
        IconComponent = FaExclamationTriangle;
        break;
      case "INFO":
        colorClass = "text-blue-600";
        IconComponent = FaInfoCircle;
        break;
      case "DEBUG":
        colorClass = "text-gray-500";
        IconComponent = FaBug;
        break;
      case "Login":
        colorClass = "text-green-600";
        IconComponent = FaSignInAlt;
        break;
      case "Logout":
        colorClass = "text-purple-600";
        IconComponent = FaSignOutAlt;
        break;
      case "CREATE_TICKET":
        colorClass = "text-indigo-600";
        IconComponent = FaTicketAlt;
        break;
      case "UPDATE_TICKET":
        colorClass = "text-orange-600";
        IconComponent = FaTicketAlt; // Can be a different icon if desired
        break;
      case "VIEW_REPORT":
        colorClass = "text-teal-600";
        IconComponent = FaEye;
        break;
      default:
        colorClass = "text-gray-700"; // Default for unhandled actions
        IconComponent = FaCogs;
        break;
    }
    return { colorClass, IconComponent };
  };

  return (
    <div className="p-4 sm:p-8 font-sans max-w-full mx-auto bg-gray-50 rounded-lg shadow-xl min-h-screen">
      {" "}
      {/* Increased max-width and added min-h-screen */}
      <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 text-center mb-8 pb-4 border-b-4 border-blue-200 flex items-center justify-center">
        <FaCogs className="mr-3 text-blue-500" /> System Activity Logs
      </h2>
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-lg">
        {" "}
        {/* Rounded-xl for more modern look */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-5 pb-2 border-b border-dashed border-gray-200">
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-3 sm:mb-0">
            Recent Activity
          </h3>
          <button
            onClick={() => dispatch(fetchLogs())}
            disabled={isLoadingLogs}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-base"
          >
            {isLoadingLogs ? (
              <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5" />
            ) : (
              <FaSyncAlt className="mr-2 h-5 w-5" /> // Using FaSyncAlt for refresh
            )}
            {isLoadingLogs ? "Refreshing..." : "Refresh Logs"}
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto border border-gray-300 rounded-lg bg-gray-100 p-4 text-sm shadow-inner">
          {" "}
          {/* Increased max-height for more content */}
          {/* Loading state display */}
          {isLoadingLogs && (
            <p className="text-gray-600 text-center py-4 flex items-center justify-center">
              <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" />
              Loading logs...
            </p>
          )}
          {/* Error state display */}
          {!isLoadingLogs && isErrorLogs && (
            <p className="text-red-600 text-center py-4 flex items-center justify-center">
              <FaExclamationCircle className="mr-2 h-5 w-5" />
              Error:{" "}
              {messageLogs ||
                "Failed to load logs. Please check your network or try again."}
            </p>
          )}
          {/* No logs found display */}
          {!isLoadingLogs && !isErrorLogs && logs.length === 0 && (
            <p className="text-gray-600 text-center py-4 flex items-center justify-center">
              <FaClipboardList className="mr-2 h-5 w-5" />
              No log entries found.
            </p>
          )}
          {/* Logs display */}
          {!isLoadingLogs &&
            !isErrorLogs &&
            logs.length > 0 &&
            logs.map((log, index) => {
              const { colorClass, IconComponent } = getLogDetails(log.Action);
              return (
                <div
                  key={index}
                  className="mb-2 p-3 bg-white rounded-md shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
                >
                  <p className="font-mono text-gray-700 flex items-center">
                    {/* Icon for the log type */}
                    <IconComponent className={`mr-2 h-4 w-4 ${colorClass}`} />
                    {/* Timestamp in local string format (IST for you) */}
                    <span className="font-semibold text-gray-500 mr-2 text-xs sm:text-sm">
                      {log.Timestamp
                        ? new Date(log.Timestamp).toLocaleString()
                        : "N/A"}
                    </span>
                    {/* Log Action with color */}
                    <span
                      className={`${colorClass} font-medium text-sm sm:text-base`}
                    >
                      [{log.Action}]
                    </span>{" "}
                    {/* Log Message or default */}
                    <span className="ml-2 text-gray-700 text-sm sm:text-base">
                      {log.Message || `User ${log.UserID} performed action.`}
                    </span>
                  </p>
                  {log.Details && (
                    <p className="text-gray-500 text-xs mt-1 ml-6 italic">
                      {log.Details}
                    </p>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default SystemSetting;
