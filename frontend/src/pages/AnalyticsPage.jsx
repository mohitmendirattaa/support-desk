import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner"; // Adjust path if needed
import {
  getTicketStatus,
  getTicketCategory,
  getTicketPriority,
  getTicketsCreatedOverTime,
  getTotalUsers,
  getTicketServiceType,
  reset,
} from "../features/analytics/analyticSlice"; // Adjust path if needed

// Import the new component that displays the analytics items
import AdminDashboardAnalyticsItems from "../components/AdminDashboardAnalyticsItems"; // Adjust path as needed

function AnalyticsPage() {
  const dispatch = useDispatch();
  const {
    ticketsByStatus,
    ticketsByCategory,
    ticketsByPriority,
    ticketsCreatedOverTime,
    totalUsers,
    ticketsByServiceType,
    isLoading,
    isError,
    message,
  } = useSelector((state) => state.analytics);

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (user && user.role === "admin") {
      dispatch(getTicketStatus());
      dispatch(getTicketCategory());
      dispatch(getTicketPriority());
      dispatch(getTicketsCreatedOverTime("30days"));
      dispatch(getTotalUsers());
      dispatch(getTicketServiceType());
    } else {
      toast.error("You are not authorized to view this page.");
    }

    return () => {
      dispatch(reset());
    };
  }, [dispatch, isError, message, user]);

  if (isLoading) {
    return <Spinner />;
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Access Denied
          </h2>
          <p className="text-lg text-gray-700">
            You do not have administrative privileges to view this page.
          </p>
        </div>
      </div>
    );
  }

  // Render the AdminDashboardAnalyticsItems component with fetched data
  return (
    <AdminDashboardAnalyticsItems
      ticketsByStatus={ticketsByStatus}
      ticketsByCategory={ticketsByCategory}
      ticketsByPriority={ticketsByPriority}
      ticketsCreatedOverTime={ticketsCreatedOverTime}
      totalUsers={totalUsers}
      ticketsByServiceType={ticketsByServiceType}
    />
  );
}

export default AnalyticsPage;
