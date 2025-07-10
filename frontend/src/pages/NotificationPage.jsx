// frontend/src/pages/NotificationPage.jsx

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchNotifications,
  markAllNotificationsAsSeen,
  resetNotifications,
  addNotification,
  updateNotification,
  markNotificationAsSeen,
  deleteNotification,
  deleteAllNotifications,
} from "../features/notifications/notificationSlice";
import {
  FaBell,
  FaEyeSlash,
  FaCheckDouble,
  FaSpinner,
  FaExclamationCircle,
  FaClipboardList,
  FaSyncAlt,
  FaExternalLinkAlt,
  FaTrashAlt,
} from "react-icons/fa";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const NotificationPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { notifications, unseenCount, isLoading, isError, message } =
    useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());

    socket.on("newTicketCreated", (notificationPayload) => {
      dispatch(addNotification(notificationPayload.notification));
    });

    socket.on("ticketStatusUpdated", (notificationPayload) => {
      dispatch(updateNotification(notificationPayload.notification));
    });

    socket.on("ticketStatusUpdatedAdmin", (notificationPayload) => {
      dispatch(updateNotification(notificationPayload.notification));
    });

    socket.on("newNoteAdded", (notificationPayload) => {
      dispatch(addNotification(notificationPayload.notification));
    });

    return () => {
      socket.off("newTicketCreated");
      socket.off("ticketStatusUpdated");
      socket.off("ticketStatusUpdatedAdmin");
      socket.off("newNoteAdded");
    };
  }, [dispatch]);

  const handleMarkAllAsSeen = () => {
    dispatch(markAllNotificationsAsSeen());
  };

  const handleViewTicket = (ticketId, notificationId) => {
    if (!ticketId) {
      console.warn(
        "Cannot navigate: Notification does not have a valid ticketId."
      );
      return;
    }

    const confirmNavigation = window.confirm(
      "You are about to view the associated ticket details. Continue?"
    );

    if (confirmNavigation) {
      if (
        notificationId &&
        typeof notificationId === "string" &&
        notificationId.length === 36
      ) {
        dispatch(markNotificationAsSeen(notificationId));
      } else {
        console.error(
          "Invalid notificationId for markNotificationAsSeen:",
          notificationId
        );
      }

      const targetPath = `/admin-dashboard/ticket-management/${ticketId}`;
      navigate(targetPath, {
        state: {
          fromNotification: true,
          notificationId: notificationId,
        },
      });
    }
  };

  const handleDeleteNotification = (notificationId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this notification? This action cannot be undone."
    );
    if (confirmDelete) {
      if (
        notificationId &&
        typeof notificationId === "string" &&
        notificationId.length === 36
      ) {
        dispatch(deleteNotification(notificationId));
      } else {
        console.error(
          "Invalid notificationId for deleteNotification:",
          notificationId
        );
      }
    }
  };

  const handleDeleteAllNotifications = () => {
    const confirmDeleteAll = window.confirm(
      "Are you sure you want to delete ALL notifications? This action cannot be undone."
    );
    if (confirmDeleteAll) {
      dispatch(deleteAllNotifications());
    }
  };

  return (
    <div className="p-4 sm:p-8 font-sans max-w-full mx-auto bg-gray-50 rounded-lg shadow-xl min-h-screen">
      <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 text-center mb-8 pb-4 border-b-4 border-blue-200 flex items-center justify-center">
        <FaBell className="mr-3 text-blue-500" /> Notifications
        {unseenCount > 0 && (
          <span className="ml-3 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
            {unseenCount}
          </span>
        )}
      </h2>

      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-5 pb-2 border-b border-dashed border-gray-200">
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-3 sm:mb-0">
            Recent Notifications
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => dispatch(fetchNotifications())}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center"
            >
              {isLoading ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaSyncAlt className="mr-2" />
              )}
              Refresh
            </button>
            <button
              onClick={handleMarkAllAsSeen}
              disabled={unseenCount === 0 || isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center disabled:opacity-50"
            >
              <FaCheckDouble className="mr-2" />
              Mark All as Seen
            </button>
            <button
              onClick={handleDeleteAllNotifications}
              disabled={notifications.length === 0 || isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition flex items-center disabled:opacity-50"
            >
              <FaTrashAlt className="mr-2" />
              Delete All
            </button>
          </div>
        </div>

        <div className="max-h-[70vh] overflow-y-auto border border-gray-300 rounded-lg bg-gray-100 p-4 text-sm shadow-inner">
          {isLoading && (
            <p className="text-gray-600 text-center py-4 flex items-center justify-center">
              <FaSpinner className="animate-spin mr-3 text-blue-500" />
              Loading notifications...
            </p>
          )}

          {!isLoading && isError && (
            <p className="text-red-600 text-center py-4 flex items-center justify-center">
              <FaExclamationCircle className="mr-2" />
              Error: {message || "Could not load notifications."}
            </p>
          )}

          {!isLoading && !isError && notifications.length === 0 && (
            <p className="text-gray-600 text-center py-4 flex items-center justify-center">
              <FaClipboardList className="mr-2" />
              No notifications found.
            </p>
          )}

          {!isLoading &&
            !isError &&
            notifications.map((notification) => (
              <div
                key={
                  notification.id ||
                  notification._id ||
                  `notification-${Date.now()}-${Math.random()}`
                }
                className={`mb-2 p-3 bg-white rounded-md shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 flex items-center justify-between ${
                  notification.isSeen
                    ? "opacity-80"
                    : "bg-yellow-50 font-semibold"
                }`}
              >
                <p className="flex items-center text-gray-800 flex-grow">
                  {" "}
                  <FaBell
                    className={`mr-2 ${
                      notification.isSeen ? "text-gray-400" : "text-yellow-600"
                    }`}
                  />
                  <span className="font-semibold text-gray-600 mr-2 text-xs sm:text-sm">
                    {new Date(notification.createdAt).toLocaleString()}
                  </span>
                  <span
                    className={`${
                      notification.isSeen
                        ? "text-gray-600"
                        : "text-yellow-700 font-medium"
                    } text-sm sm:text-base`}
                  >
                    {notification.message}
                  </span>
                  {!notification.isSeen && (
                    <FaEyeSlash className="ml-2 text-yellow-600" />
                  )}
                </p>
                <div className="flex items-center space-x-2">
                  {notification.ticketId && (
                    <button
                      onClick={() => {
                        handleViewTicket(
                          notification.ticketId,
                          notification.id
                        );
                      }}
                      className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors duration-200 flex-shrink-0"
                      title="View Associated Ticket"
                    >
                      <FaExternalLinkAlt />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleDeleteNotification(notification.id);
                    }}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200 flex-shrink-0"
                    title="Delete Notification"
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
