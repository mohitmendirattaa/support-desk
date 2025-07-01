// frontend/src/pages/TicketStatusPage.jsx
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";
import TicketStatusSummaryChart from "../components/TicketStatusSummaryChart";

import {
  getTicketStatus,
  getTicketsCreatedOverTime,
  reset,
} from "../features/analytics/analyticSlice";

function TicketStatusPage() {
  const dispatch = useDispatch();
  const {
    ticketsByStatus,
    ticketsCreatedOverTime,
    isLoading,
    isError,
    message,
  } = useSelector((state) => state.analytics);
  const { user } = useSelector((state) => state.auth);

  const [selectedTimeframe, setSelectedTimeframe] = useState("30days");

  const handleTimeframeChange = (timeframe) => {
    setSelectedTimeframe(timeframe);
  };

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (user && user.role === "admin") {
      dispatch(getTicketStatus());
      dispatch(getTicketsCreatedOverTime(selectedTimeframe));
    } else {
      toast.error("You are not authorized to view this page.");
    }

    return () => {
      dispatch(reset());
    };
  }, [dispatch, isError, message, user, selectedTimeframe]);

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

  return (
    <div className="p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 mb-2">
          Ticket Status Overview
        </h1>
        <p className="text-lg text-gray-600">
          A focused view of your support tickets by their current status.
        </p>
      </div>

      {/* CHANGED: Adjusted wrapper div to control width and centering */}
      <div className="w-full max-w-6xl mx-auto">
        {" "}
        {/* Added max-w-6xl and mx-auto */}
        <TicketStatusSummaryChart
          ticketsByStatusData={ticketsByStatus}
          ticketsCreatedOverTimeData={ticketsCreatedOverTime}
          onTimeframeChange={handleTimeframeChange}
          selectedTimeframe={selectedTimeframe}
        />
      </div>
    </div>
  );
}

export default TicketStatusPage;
