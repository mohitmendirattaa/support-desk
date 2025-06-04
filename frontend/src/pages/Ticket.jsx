import React from "react";
// import BackButton from "../components/BackButton"; // BackButton removed from import
import { useEffect } from "react";
import { toast } from "react-toastify";
import {
  FaPencilAlt,
  FaTimesCircle,
  FaCalendarAlt,
  FaInfoCircle,
} from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { getTicket, closeTicket } from "../features/tickets/ticketSlice";
import { useParams, useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";

function Ticket() {
  const { ticket, isLoading, isError, message } = useSelector(
    (state) => state.tickets
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { ticketId } = useParams();

  // Reverting status classes to simpler, light-theme friendly versions
  const getStatusClasses = (status) => {
    switch (status) {
      case "new":
        return "bg-blue-200 text-blue-800"; 
      case "open":
        return "bg-green-200 text-green-800"; 
      case "closed":
        return "bg-red-200 text-red-800"; 
      default:
        return "bg-gray-200 text-gray-800"; 
    }
  };

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
    dispatch(getTicket(ticketId))
      .unwrap()
      .catch((error) => {
        toast.error(error.message || "Failed to load ticket details.");
        navigate("/tickets");
      });
  }, [ticketId, dispatch, isError, message, navigate]);

  if (isLoading || !ticket) {
    return <Spinner />;
  }

  // Error State Styling: BackButton removed from here
  if (isError || !ticket._id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-red-50 text-red-700 p-8 rounded-lg shadow-md">
        <FaInfoCircle className="text-4xl mb-4 text-red-600" />
        <h2 className="text-2xl font-bold mb-4">Ticket Load Error</h2>
        <p className="text-lg text-center">
          {message ||
            "The requested ticket could not be found or accessed. Please try again."}
        </p>
        {/* <div className="mt-8">
          <BackButton />
        </div> */}
      </div>
    );
  }

  const onTicketClose = () => {
    dispatch(closeTicket(ticketId))
      .unwrap()
      .then(() => {
        toast.success("Ticket Closed Successfully!");
        navigate("/tickets");
      })
      .catch((error) => {
        toast.error(error.message || "Failed to close ticket.");
      });
  };

  const handleEditClick = () => {
    toast.info("Edit functionality is under construction. Stay tuned!");
  };

  const formatDate = (dateString) => {
    return dateString
      ? new Date(dateString).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "N/A";
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

  return (
    
    <div className="min-h-screen bg-gray-50 text-gray-800 py-28 px-4 sm:px-6 lg:px-8">
      {/* Header section with Ticket Info (BackButton removed from here) */}
      <header className="container mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        {/* <BackButton />  <- BackButton removed */}

        <div className="flex-grow text-center md:text-left">
          {/* H1 heading: Reverted to styling similar to Tickets.jsx */}
          <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-800 tracking-tight flex flex-col md:flex-row items-center justify-center md:justify-start gap-4 flex-wrap">
            Ticket {/* Ticket ID text: Now showing full ID and uppercase */}
            <span className="text-gray-900">#{ticket._id.toUpperCase()}</span>
            <span
              className={`px-5 py-2 rounded-full text-base sm:text-lg font-bold uppercase shadow-lg ${getStatusClasses(
                ticket.status
              )}`}
            >
              {ticket.status}
            </span>
          </h1>
          {/* Submitted On text: Reverted to darker text for light theme */}
          <p className="text-gray-600 text-sm sm:text-base mt-2 flex items-center justify-center md:justify-start gap-2">
            <FaCalendarAlt className="text-blue-600" /> Submitted On:{" "}
            {formatDateTime(ticket.createdAt)}
          </p>
        </div>

        {/* Action Buttons Group: Reverted to simple button styles */}
        <div className="flex gap-4 mt-6 md:mt-0 flex-wrap justify-center md:justify-end w-full md:w-auto">
          <button
            onClick={handleEditClick}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
          >
            <FaPencilAlt /> Edit Ticket
          </button>
          {ticket.status !== "closed" && (
            <button
              onClick={onTicketClose}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors"
            >
              <FaTimesCircle /> Close Ticket
            </button>
          )}
        </div>
      </header>

      {/* Main Ticket Details Cards Section: Reverted to light theme card styles */}
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Ticket Details Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          {/* Heading: Reverted to light theme colors and border */}
          <h2 className="text-2xl font-bold text-blue-700 mb-6 pb-4 border-b border-gray-200">
            <FaInfoCircle className="inline-block mr-3 text-blue-700" />
            Issue Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
            <DetailItem label="Service Type" value={ticket.service} />
            <DetailItem label="Category" value={ticket.category} />
            <DetailItem label="Sub-Category" value={ticket.subCategory} />
            <DetailItem
              label="Priority"
              value={ticket.priority}
              highlight={true}
            />
            <DetailItem
              label="Start Date"
              value={formatDate(ticket.startDate)}
            />
            <DetailItem
              label="Target Resolution"
              value={formatDate(ticket.endDate)}
            />
          </div>
        </div>

        {/* Description & Notes Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 flex flex-col">
          {/* Description Section */}
          <h2 className="text-2xl font-bold text-blue-700 mb-6 pb-4 border-b border-gray-200">
            <FaPencilAlt className="inline-block mr-3 text-blue-700" />
            Detailed Description
          </h2>
          {/* Description content area: Reverted to light theme styles */}
          <div className="flex-grow bg-gray-50 p-6 rounded-lg text-gray-700 text-lg leading-relaxed border border-gray-200">
            <p>{ticket.description}</p>
          </div>

          {/* Notes Section (Placeholder for future comments/updates) */}
          <h2 className="text-2xl font-bold text-blue-700 mt-8 mb-6 pb-4 border-b border-gray-200">
            <FaInfoCircle className="inline-block mr-3 text-blue-700" />
            Notes
          </h2>
          {/* Notes content area: Reverted to light theme styles */}
          <div className="text-gray-500 italic bg-gray-50 p-6 rounded-lg border border-gray-200">
            No internal notes or updates available for this ticket yet.
          </div>
        </div>
      </div>
    </div>
  );
}

// DetailItem component: Reverted text colors for light theme
const DetailItem = ({ label, value, highlight = false }) => (
  <div>
    <p className="text-gray-500 font-medium text-sm uppercase tracking-wider mb-1">
      {label}
    </p>
    <p
      className={`text-xl font-semibold ${
        highlight ? "text-orange-600" : "text-gray-900"
      }`}
    >
      {value || "N/A"}
    </p>
  </div>
);

export default Ticket;
