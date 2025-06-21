import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getSingleTicketAsAdmin,
  reset,
  closeTicket,
} from "../features/tickets/ticketSlice"; // closeTicket imported
import {
  getNotes, // Import getNotes action
  reset as resetNotes, // Import reset for notes slice
} from "../features/notes/noteSlice"; // Import note actions and reset
import Spinner from "../components/Spinner";
import BackButton from "../components/BackButton";
import {
  FaPencilAlt,
  FaTimesCircle,
  FaCalendarAlt,
  FaInfoCircle,
  FaPaperclip,
  FaFilePdf,
  FaFileWord,
  FaFileAlt,
  FaUserCircle, // For user avatar in notes
  FaIdBadge, // For staff avatar in notes
} from "react-icons/fa";

function ViewSingleTicket() {
  const { ticket, isLoading, isError, message } = useSelector(
    (state) => state.tickets
  );
  // Get notes state from the Redux store
  const {
    notes,
    isLoading: isLoadingNotes,
    isError: isErrorNotes,
    message: notesMessage,
  } = useSelector((state) => state.notes);

  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { ticketId } = useParams();
  const navigate = useNavigate();

  // Returns Tailwind CSS classes based on ticket status
  const getStatusClasses = (status) => {
    switch (status) {
      case "new":
        return "bg-blue-200 text-blue-800";
      case "open":
        return "bg-green-200 text-green-800";
      case "closed":
        return "bg-red-200 text-red-800";
      case "reopened": // Added for completeness if you use it for admin view
        return "bg-purple-200 text-purple-800";
      case "pending":
        return "bg-yellow-200 text-yellow-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  // Returns Tailwind CSS classes based on ticket priority
  const getPriorityClasses = (priority) => {
    switch (priority) {
      case "High":
        return "text-red-600";
      case "Medium":
        return "text-orange-600";
      case "Low":
        return "text-green-600";
      default:
        return "text-gray-900";
    }
  };

  // Effect hook to fetch ticket details and handle authorization
  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
    if (isErrorNotes) {
      toast.error(notesMessage); // Handle errors specific to notes
    }

    if (!user) {
      navigate("/login"); // Redirect if no user is logged in
    } else if (user.role !== "admin") {
      toast.error("You are not authorized to view this page.");
      navigate("/admin-dashboard"); // Redirect if user is not an admin
    } else {
      // Fetch ticket for admin view
      dispatch(getSingleTicketAsAdmin(ticketId));
      // Fetch notes for the ticket
      dispatch(getNotes(ticketId));
    }

    // Cleanup function: reset ticket and notes state when component unmounts
    return () => {
      dispatch(reset());
      dispatch(resetNotes()); // Reset notes state too
    };
  }, [
    ticketId,
    user,
    isError,
    message,
    dispatch,
    navigate,
    isErrorNotes,
    notesMessage,
  ]);

  // Display spinner while loading
  if (isLoading || isLoadingNotes) {
    // Check for notes loading too
    return <Spinner />;
  }

  // Display error message if loading fails or ticket data is missing
  if (isError || !ticket || !ticket.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-red-50 text-red-700 p-8 rounded-lg shadow-md mx-auto max-w-lg mt-10">
        <FaInfoCircle className="text-4xl mb-4 text-red-600" />
        <h2 className="text-2xl font-bold mb-4">Ticket Load Error</h2>
        <p className="text-lg text-center">
          {message ||
            "Could not load ticket details. Please try again or check the ticket ID."}
        </p>
        <div className="mt-8">
          <BackButton url="/admin-dashboard/tickets" />
        </div>
      </div>
    );
  }

  // Handler for the "Edit Ticket" button
  const handleEditClick = () => {
    toast.info("Edit functionality is under construction. Stay tuned!");
  };

  // Handler for closing a ticket
  const onTicketClose = () => {
    dispatch(closeTicket(ticketId))
      .unwrap()
      .then(() => {
        toast.success("Ticket Closed Successfully!");
        navigate("/admin-dashboard/tickets"); // Redirect back to admin tickets list
      })
      .catch((error) => {
        toast.error(error.message || "Failed to close ticket.");
      });
  };

  // Formats a date string into a localized date format
  const formatDate = (dateString) => {
    return dateString
      ? new Date(dateString).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "N/A";
  };

  // Formats a date string into a localized date and time format
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

  // Function to render the attachment section based on ticket data
  const renderAttachment = () => {
    const { attachment, attachmentMimeType, attachmentFileName } = ticket;

    // Check if all attachment details are present
    if (attachment && attachmentMimeType && attachmentFileName) {
      // Create a data URL from the Base64 attachment data and MIME type
      const dataUrl = `data:${attachmentMimeType};base64,${attachment}`;

      // Determine the appropriate file icon based on MIME type
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
              target="_blank" // Opens the file in a new tab
              rel="noopener noreferrer" // Security best practice
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
      // Fallback if attachment data exists but metadata (MIME type/filename) is missing
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
    // Message displayed when no attachment is available for the ticket
    return (
      <div className="text-gray-500 italic bg-gray-50 p-6 rounded-lg border border-gray-200">
        No attachment for this ticket.
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-gray-50 pb-24">
      {/* Page Header */}
      <header className="flex justify-between items-center mb-8">
        <BackButton url="/admin-dashboard/tickets" />
        <h1 className="text-4xl font-extrabold text-blue-800 tracking-tight text-center flex-grow">
          {ticket.service || "Support"} Ticket
        </h1>
        <div className="w-auto opacity-0">
          <BackButton /> {/* Invisible back button for spacing symmetry */}
        </div>
      </header>
      {/* Ticket ID, Status, and Submission Date */}
      <header className="container mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div className="flex-grow text-center md:text-left">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-800 tracking-tight flex flex-col md:flex-row items-center justify-center md:justify-start gap-4 flex-wrap">
            Ticket
            <span className="text-gray-900">#{ticket.id?.toUpperCase()}</span>
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

        {/* Action Buttons */}
        <div className="flex gap-4 mt-6 md:mt-0 flex-wrap justify-center md:justify-end w-full md:w-auto">
          <button
            onClick={handleEditClick}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
          >
            <FaPencilAlt /> Edit Ticket
          </button>
          {/* Close Ticket button, conditionally rendered if not already closed */}
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
      {/* Main Content Grid */}
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Information Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-blue-700 mb-6 pb-4 border-b border-gray-200">
            <FaInfoCircle className="inline-block mr-3 text-blue-700" />
            User Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
            <DetailItem label="User ID" value={ticket.userId || "N/A"} />
            <DetailItem label="Name" value={ticket.user?.name || "N/A"} />
            <DetailItem label="Email" value={ticket.user?.email || "N/A"} />
            <DetailItem
              label="Employee Code"
              value={ticket.user?.employeeCode || "N/A"}
            />
          </div>
        </div>

        {/* Issue Overview Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-blue-700 mb-6 pb-4 border-b border-gray-200">
            <FaInfoCircle className="inline-block mr-3 text-blue-700" />
            Issue Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
            <DetailItem label="Service Type" value={ticket.service || "N/A"} />
            <DetailItem label="Category" value={ticket.category || "N/A"} />
            <DetailItem
              label="Sub-Category"
              value={ticket.subCategory || "N/A"}
            />
            <DetailItem
              label="Priority"
              value={ticket.priority || "N/A"}
              highlight={true}
              priorityClass={getPriorityClasses(ticket.priority)}
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

        {/* Detailed Description Section (Full width) */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 flex flex-col lg:col-span-2">
          <h2 className="text-2xl font-bold text-blue-700 mt-0 mb-6 pb-4 border-b border-gray-200">
            <FaPencilAlt className="inline-block mr-3 text-blue-700" />
            Detailed Description
          </h2>
          <div className="flex-grow bg-gray-50 p-6 rounded-lg text-gray-700 text-lg leading-relaxed border border-gray-200">
            <p>{ticket.description || "No description provided."}</p>
          </div>

          {/* Attachments Section */}
          <h2 className="text-2xl font-bold text-blue-700 mt-8 mb-6 pb-4 border-b border-gray-200">
            <FaPaperclip className="inline-block mr-3 text-blue-700" />
            Attachments
          </h2>
          {renderAttachment()}
        </div>
      </div>
      {/* --- Notes Section --- */}
      <div className="mt-9 bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-blue-700 mb-6 pb-4 border-b border-gray-200">
          <FaInfoCircle className="inline-block mr-3 text-blue-700" />
          Ticket Notes
        </h2>

        {/* Display Notes */}
        {notes.length > 0 ? (
          <div className="space-y-6">
            {notes.map((note) => (
              <div
                key={note.id}
                className={`p-6 rounded-lg shadow-sm border ${
                  note.isStaff
                    ? "bg-blue-50 border-blue-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center mb-3">
                  {note.isStaff ? (
                    <FaIdBadge className="text-blue-600 text-2xl mr-3" />
                  ) : (
                    <FaUserCircle className="text-gray-600 text-2xl mr-3" />
                  )}
                  <p className="font-semibold text-lg text-gray-800">
                    {note.isStaff ? (
                      <span className="text-blue-600">
                        Staff Note from {note.userName}
                      </span>
                    ) : (
                      `Note from ${note.userName}`
                    )}
                  </p>
                </div>
                <p className="text-gray-700 leading-relaxed mb-3">
                  {note.text}
                </p>
                <p className="text-sm text-gray-500 text-right">
                  Added on: {formatDateTime(note.createdAt)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 italic bg-gray-50 p-6 rounded-lg border border-gray-200">
            No notes found for this ticket.
          </div>
        )}
      </div>
    </div>
  );
}

// Reusable component for displaying a detail item (label and value)
const DetailItem = ({
  label,
  value,
  highlight = false,
  priorityClass = "",
}) => (
  <div>
    <p className="text-gray-500 font-medium text-sm uppercase tracking-wider mb-1">
      {label}
    </p>
    <p
      className={`text-xl font-semibold ${
        highlight ? priorityClass : "text-gray-900"
      }`}
    >
      {value || "N/A"}
    </p>
  </div>
);

export default ViewSingleTicket;
