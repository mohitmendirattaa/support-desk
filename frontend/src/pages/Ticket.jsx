import React from "react";
import { useEffect } from "react";
import { toast } from "react-toastify";
import {
  FaPencilAlt,
  FaTimesCircle,
  FaCalendarAlt,
  FaInfoCircle,
  FaPaperclip,
  FaFilePdf,
  FaFileWord,
  FaFileAlt, // Generic file icon
} from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { getTicket, closeTicket } from "../features/tickets/ticketSlice";
import { useParams, useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import BackButton from "../components/BackButton";

function Ticket() {
  const { ticket, isLoading, isError, message } = useSelector(
    (state) => state.tickets
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { ticketId } = useParams();

  // Determines CSS classes for ticket status display
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

  // Fetches ticket data on component mount or ticketId change
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

  // Shows a spinner while loading ticket data
  if (isLoading) {
    return <Spinner />;
  }

  // Displays an error message if ticket loading fails
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-red-50 text-red-700 p-8 rounded-lg shadow-md">
        <FaInfoCircle className="text-4xl mb-4 text-red-600" />
        <h2 className="text-2xl font-bold mb-4">Ticket Load Error</h2>
        <p className="text-lg text-center">
          {message ||
            "The requested ticket could not be found or accessed. Please try again."}
        </p>
      </div>
    );
  }

  // Shows a spinner if ticket object is not yet available
  if (!ticket || !ticket.id) {
    return <Spinner />;
  }

  // Handler for closing a ticket
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

  // Placeholder for edit functionality
  const handleEditClick = () => {
    toast.info("Edit functionality is under construction. Stay tuned!");
  };

  // Formats date strings to a readable format (e.g., "June 14, 2025")
  const formatDate = (dateString) => {
    return dateString
      ? new Date(dateString).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "N/A";
  };

  // Formats date-time strings to a readable format (e.g., "Jun 14, 2025, 12:00 PM")
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

  // Renders the attachment section
  const renderAttachment = () => {
    const { attachment, attachmentMimeType, attachmentFileName } = ticket;

    // If attachment data, MIME type, and filename are all available
    if (attachment && attachmentMimeType && attachmentFileName) {
      const dataUrl = `data:${attachmentMimeType};base64,${attachment}`;

      // Determine appropriate icon based on MIME type
      const isPdf = attachmentMimeType === "application/pdf";
      const isWord =
        attachmentMimeType.includes("wordprocessingml") ||
        attachmentMimeType === "application/msword";

      return (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-200">
          <p className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
            <FaPaperclip className="text-blue-600" /> Attached File:
            <a
              href={dataUrl}
              download={attachmentFileName} // This attribute forces download
              target="_blank" // Opens in a new tab
              rel="noopener noreferrer" // Security best practice for target="_blank"
              className="text-blue-600 hover:underline flex items-center ml-2"
            >
              {isPdf && <FaFilePdf className="mr-1" />}
              {isWord && <FaFileWord className="mr-1" />}
              {!isPdf && !isWord && <FaFileAlt className="mr-1" />}{" "}
              {attachmentFileName}
            </a>
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Click the link above to download the file.
          </p>
        </div>
      );
    } else if (attachment) {
      // Fallback for cases where attachment data exists but metadata is missing
      return (
        <div className="mt-4 p-4 bg-yellow-100 rounded-lg border border-yellow-200 text-yellow-800">
          <p className="font-semibold flex items-center gap-2">
            <FaInfoCircle /> Attachment found, but type/name missing from
            backend.
          </p>
          <p className="text-sm mt-1">
            <a
              href={`data:application/octet-stream;base64,${attachment}`}
              download="attachment"
              className="text-blue-600 hover:underline flex items-center"
            >
              <FaFileAlt className="mr-1" /> Download Generic File
            </a>
          </p>
        </div>
      );
    }
    // Message when no attachment is present
    return (
      <div className="text-gray-500 italic bg-gray-50 p-6 rounded-lg border border-gray-200">
        No attachment for this ticket.
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-gray-50">
      <header className="flex justify-between items-center mb-8">
        <BackButton />
        <h1 className="text-4xl font-extrabold text-blue-800 tracking-tight text-center flex-grow">
          {ticket.ServiceType} Ticket
        </h1>
        <div className="w-auto opacity-0">
          <BackButton />
        </div>
      </header>
      <header className="container mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div className="flex-grow text-center md:text-left">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-800 tracking-tight flex flex-col md:flex-row items-center justify-center md:justify-start gap-4 flex-wrap">
            Ticket
            <span className="text-gray-900">#{ticket.id.toUpperCase()}</span>
            <span
              className={`px-5 py-2 rounded-full text-base sm:text-lg font-bold uppercase shadow-lg ${getStatusClasses(
                ticket.status
              )}`}
            >
              {ticket.status}
            </span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base mt-2 flex items-center justify-center md:justify-start gap-2">
            <FaCalendarAlt className="text-blue-600" /> Submitted On:
            {formatDateTime(ticket.createdAt)}
          </p>
        </div>

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

      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-blue-700 mb-6 pb-4 border-b border-gray-200">
            <FaInfoCircle className="inline-block mr-3 text-blue-700" />
            Issue Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
            <DetailItem
              label="Service Type"
              value={ticket.ServiceType || "N/A"}
            />
            <DetailItem label="Category" value={ticket.category || "N/A"} />
            <DetailItem
              label="Sub-Category"
              value={ticket.subCategory || "N/A"}
            />
            <DetailItem
              label="Priority"
              value={ticket.priority || "N/A"}
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

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 flex flex-col">
          <h2 className="text-2xl font-bold text-blue-700 mb-4 pb-4 border-b border-gray-200">
            <FaPencilAlt className="inline-block mr-3 text-blue-700" />
            Detailed Description
          </h2>
          <div className="flex-grow bg-gray-50 p-6 rounded-lg text-gray-700 text-lg leading-relaxed border border-gray-200 mb-8">
            <p>{ticket.description || "No description provided."}</p>
          </div>

          <h2 className="text-2xl font-bold text-blue-700 mb-2 pb-4 border-b border-gray-200">
            <FaPaperclip className="inline-block mr-3 text-blue-700" />
            Attachments
          </h2>
          {renderAttachment()}
        </div>
      </div>
    </div>
  );
}

// Reusable component for displaying a detail item (label and value)
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
