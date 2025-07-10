// frontend/src/pages/UserNotification.jsx
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  fetchUserNotifications,
  markUserNotificationAsSeen,
  markAllUserNotificationsAsSeen,
  resetUserNotifications,
  getUnseenUserNotificationsCount,
  // You might want to add deleteAllUserNotifications later for a "Clear all" button
} from "../features/userNotifications/userNotificationSlice";

import Spinner from "../components/Spinner";
import BackButton from "../components/BackButton";
import {
  FaBell,
  FaCheckCircle,
  FaExclamationCircle,
  FaTicketAlt,
  FaSyncAlt,
} from "react-icons/fa";

// Constants for message truncation
const MAX_MESSAGE_LENGTH = 120; // Adjusted for better fit in cards

function UserNotification() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { userNotifications, isLoading, isError, message, unseenCount } =
    useSelector((state) => state.userNotifications);

  // State to manage which specific notification messages are expanded
  const [expandedMessages, setExpandedMessages] = useState({});

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      dispatch(fetchUserNotifications());
      dispatch(getUnseenUserNotificationsCount());
    }

    return () => {
      dispatch(resetUserNotifications());
    };
  }, [user, navigate, dispatch]);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
  }, [isError, message]);

  const toggleMessageExpansion = (id) => {
    setExpandedMessages((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleMarkAsSeen = (notificationId) => {
    dispatch(markUserNotificationAsSeen(notificationId))
      .unwrap()
      .then(() => {
        toast.success("Notification marked as seen.");
      })
      .catch((error) => {
        toast.error(error?.message || "Failed to mark notification as seen.");
      });
  };

  const handleMarkAllAsSeen = () => {
    if (unseenCount === 0) {
      toast.info("No unseen notifications to mark as seen.");
      return;
    }
    dispatch(markAllUserNotificationsAsSeen())
      .unwrap()
      .then(() => {
        toast.success("All notifications marked as seen!");
      })
      .catch((error) => {
        toast.error(
          error?.message || "Failed to mark all notifications as seen."
        );
      });
  };

  const handleRefreshNotifications = () => {
    dispatch(fetchUserNotifications())
      .unwrap()
      .then(() => {
        toast.success("Notifications refreshed!");
        dispatch(getUnseenUserNotificationsCount());
      })
      .catch((error) => {
        toast.error(error?.message || "Failed to refresh notifications.");
      });
  };

  const handleViewTicket = (ticketId) => {
    if (ticketId) {
      navigate(`/tickets/${ticketId}`);
    } else {
      toast.info("No specific ticket associated with this notification.");
    }
  };

  const formatDateTime = (dateString) => {
    return dateString
      ? new Date(dateString).toLocaleString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "N/A";
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (isError && userNotifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-red-50 text-red-700 p-8 rounded-lg shadow-md mx-auto max-w-lg mt-10">
        <FaExclamationCircle className="text-4xl mb-4 text-red-600" />
        <h2 className="text-2xl font-bold mb-4">Error Loading Notifications</h2>
        <p className="text-lg text-center">
          {message || "Could not load notifications. Please try again."}
        </p>
        <div className="mt-8">
          <BackButton url={user?.role === "admin" ? "/admin-dashboard" : "/"} />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        {/* Wrap BackButton in a div to control its width */}
        <div className="flex-shrink-0 w-24 sm:w-auto">
          {" "}
          {/* Added w-24 for consistent width */}
          <BackButton url={user?.role === "admin" ? "/admin-dashboard" : "/"} />
        </div>

        {/* This h1 will now truly take available center space */}
        <h1 className="text-4xl font-extrabold text-blue-800 tracking-tight text-center flex-grow flex items-center justify-center">
          <FaBell className="mr-3 text-blue-600" /> Your Notifications
        </h1>

        {/* Wrap buttons in a div to control their width */}
        <div className="flex gap-3 flex-shrink-0 w-24 sm:w-auto justify-end">
          {" "}
          {/* Added w-24 and justify-end */}
          <button
            onClick={handleRefreshNotifications}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg shadow-sm hover:bg-gray-300 transition-colors flex items-center gap-2 text-sm font-semibold whitespace-nowrap"
          >
            <FaSyncAlt /> Refresh
          </button>
          <button
            onClick={handleMarkAllAsSeen}
            disabled={unseenCount === 0}
            className={`px-4 py-2 rounded-lg shadow-md transition-colors flex items-center gap-2 text-sm font-semibold whitespace-nowrap ${
              unseenCount === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            <FaCheckCircle /> Mark All Seen
          </button>
        </div>
      </header>

      {/* REMOVED max-w-3xl from this div */}
      <div className=" max-w-5xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 p-6 sm:p-8">
        {userNotifications.length === 0 ? (
          <div className="text-center py-10 text-gray-600 text-lg">
            <FaExclamationCircle className="mx-auto text-5xl mb-4 text-gray-400" />
            <p>You have no notifications at the moment.</p>
          </div>
        ) : (
          <ul className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            {userNotifications.map((notification) => {
              const isExpanded = expandedMessages[notification.id];
              const shouldTruncate =
                notification.message.length > MAX_MESSAGE_LENGTH;
              const displayMessage =
                shouldTruncate && !isExpanded
                  ? notification.message.substring(0, MAX_MESSAGE_LENGTH) +
                    "..."
                  : notification.message;

              return (
                <li
                  key={notification.id}
                  className={`p-4 rounded-lg shadow-sm border flex flex-col sm:flex-row sm:items-start justify-between gap-3 ${
                    notification.isSeen
                      ? "bg-gray-50 border-gray-200 text-gray-700"
                      : "bg-blue-50 border-blue-200 text-blue-800 font-semibold"
                  }`}
                >
                  {/* Message Content */}
                  <div className="flex-grow min-w-0">
                    <p className="text-base sm:text-lg mb-1 break-words">
                      {displayMessage}
                      {shouldTruncate && (
                        <button
                          onClick={() =>
                            toggleMessageExpansion(notification.id)
                          }
                          className="ml-2 text-blue-600 hover:underline text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded"
                          aria-expanded={isExpanded}
                          aria-controls={`notification-message-${notification.id}`}
                        >
                          {isExpanded ? "Read Less" : "Read More"}
                        </button>
                      )}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Received: {formatDateTime(notification.createdAt)}
                    </p>
                  </div>
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-start sm:items-center mt-2 sm:mt-0 flex-shrink-0">
                    {notification.ticketId && (
                      <button
                        onClick={() => handleViewTicket(notification.ticketId)}
                        className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors flex items-center gap-1 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                      >
                        <FaTicketAlt /> View Ticket
                      </button>
                    )}
                    {!notification.isSeen && (
                      <button
                        onClick={() => handleMarkAsSeen(notification.id)}
                        className="px-3 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 transition-colors flex items-center gap-1 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                      >
                        <FaCheckCircle /> Mark as Seen
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default UserNotification;
