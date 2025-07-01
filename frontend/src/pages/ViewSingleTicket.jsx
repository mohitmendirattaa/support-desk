import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getSingleTicketAsAdmin,
  reset,
  updateTicketStatus, // Correctly importing updateTicketStatus
} from "../features/tickets/ticketSlice";
import { getNotes, reset as resetNotes } from "../features/notes/noteSlice";
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
  FaUserCircle,
  FaIdBadge,
  FaChevronDown,
} from "react-icons/fa";

function ViewSingleTicket() {
  const { ticket, isLoading, isError, message } = useSelector(
    (state) => state.tickets
  );
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

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getStatusClasses = (status) => {
    switch (status) {
      case "open":
        return "bg-blue-200 text-blue-800";
      case "new":
        return "bg-green-200 text-green-800";
      case "closed":
        return "bg-red-200 text-red-800";
      case "reopened":
        return "bg-purple-200 text-purple-800";
      case "pending":
        return "bg-yellow-200 text-yellow-800";
      case "hold":
        return "bg-orange-200 text-orange-800";
      case "resolved":
        return "bg-teal-200 text-teal-800"; // This is already defined correctly
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

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

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
    if (isErrorNotes) {
      toast.error(notesMessage);
    }

    if (!user) {
      navigate("/login");
    } else if (user.role !== "admin") {
      toast.error("You are not authorized to view this page.");
      navigate("/admin-dashboard"); // Assuming this is the correct redirect for non-admins
    } else {
      dispatch(getSingleTicketAsAdmin(ticketId));
      dispatch(getNotes(ticketId));
    }

    // Cleanup function
    return () => {
      dispatch(reset());
      dispatch(resetNotes());
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

  if (isLoading || isLoadingNotes) {
    return <Spinner />;
  }

  // Handle case where ticket data is not loaded or invalid
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

  const handleEditClick = () => {
    toast.info("Edit functionality is under construction. Stay tuned!");
  };

  const handleStatusUpdate = (newStatus) => {
    setIsDropdownOpen(false); // Close dropdown immediately

    dispatch(updateTicketStatus({ ticketId, newStatus }))
      .unwrap() // Use unwrap() to handle fulfilled or rejected promises
      .then(() => {
        toast.success(`Ticket status updated to "${newStatus}"!`);
        // If status becomes closed or resolved, navigate to tickets list
        if (newStatus === "closed" || newStatus === "resolved") {
          navigate("/admin-dashboard/tickets");
        }
      })
      .catch((error) => {
        // Display error message from backend or a generic one
        toast.error(
          error.message || `Failed to update ticket to ${newStatus}.`
        );
      });
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

  const renderAttachment = () => {
    const { attachment, attachmentMimeType, attachmentFileName } = ticket;

    if (attachment && attachmentMimeType && attachmentFileName) {
      const dataUrl = `data:${attachmentMimeType};base64,${attachment}`;

      const isPdf = attachmentMimeType === "application/pdf";
      const isWord =
        attachmentMimeType.includes("wordprocessingml") ||
        attachmentMimeType === "application/msword"; // More robust check for Word

      return (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-200">
          <p className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
            <FaPaperclip className="text-blue-600" /> Attached File:
            <a
              href={dataUrl}
              download={attachmentFileName}
              target="_blank"
              rel="noopener noreferrer"
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
      // Fallback for cases where MIME type or filename is missing but attachment data exists
      return (
        <div className="mt-4 p-4 bg-yellow-100 rounded-lg border border-yellow-200 text-yellow-800">
          <p className="font-semibold flex items-center gap-2">
            <FaInfoCircle /> Attachment found, but type/name missing from
            backend.
          </p>
          <p className="text-sm mt-1">
            <a
              href={`data:application/octet-stream;base64,${attachment}`} // Generic binary stream
              download="attachment_unknown_type" // Provide a generic download name
              className="text-blue-600 hover:underline flex items-center"
            >
              <FaFileAlt className="mr-1" /> Download Generic File
            </a>
          </p>
        </div>
      );
    }
    return (
      <div className="text-gray-500 italic bg-gray-50 p-6 rounded-lg border border-gray-200">
        No attachment for this ticket.
      </div>
    );
  };

  // Determine if the ticket is in a final, non-editable state
  const isTicketClosed = ticket.status === "closed";
  const isTicketResolved = ticket.status === "resolved";

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-gray-50 pb-24">
      <header className="flex justify-between items-center mb-8">
        <BackButton url="/admin-dashboard/tickets" />
        <h1 className="text-4xl font-extrabold text-blue-800 tracking-tight text-center flex-grow">
          {ticket.service || "Support"} Ticket
        </h1>
        {/* Placeholder for symmetry, adjust as needed */}
        <div className="w-auto opacity-0">
          <BackButton />
        </div>
      </header>

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

        <div className="flex gap-4 mt-6 md:mt-0 flex-wrap justify-center md:justify-end w-full md:w-auto">
          <button
            onClick={handleEditClick}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
          >
            <FaPencilAlt /> Edit Ticket
          </button>

          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
            >
              Update Status <FaChevronDown className="ml-2" />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                {/* Status Update Options */}
                {/* Option to change to 'hold' */}
                {ticket.status !== "hold" &&
                  !isTicketClosed &&
                  !isTicketResolved && (
                    <button
                      onClick={() => handleStatusUpdate("hold")}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Hold
                    </button>
                  )}
                {/* Option to change to 'pending' */}
                {ticket.status !== "pending" &&
                  !isTicketClosed &&
                  !isTicketResolved && (
                    <button
                      onClick={() => handleStatusUpdate("pending")}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Pending
                    </button>
                  )}
                {/* Option to change to 'resolved' */}
                {/* Show "Resolve" if not already resolved or closed */}
                {!isTicketResolved && !isTicketClosed && (
                  <button
                    onClick={() => handleStatusUpdate("resolved")}
                    className="block w-full text-left px-4 py-2 text-teal-700 hover:bg-teal-50" // Teal color for Resolve
                  >
                    Resolve
                  </button>
                )}
                {/* Option to change to 'closed' */}
                {/* Show "Close" if not already closed */}
                {!isTicketClosed && (
                  <button
                    onClick={() => handleStatusUpdate("closed")}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                  >
                    Close
                  </button>
                )}
                {/* Option to change to 'reopened' */}
                {/* Show "Reopen" ONLY if current status is "closed" */}
                {ticket.status === "closed" && (
                  <button
                    onClick={() => handleStatusUpdate("reopened")}
                    className="block w-full text-left px-4 py-2 text-purple-600 hover:bg-purple-50"
                  >
                    Reopen
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
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

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 flex flex-col lg:col-span-2">
          <h2 className="text-2xl font-bold text-blue-700 mt-0 mb-6 pb-4 border-b border-gray-200">
            <FaPencilAlt className="inline-block mr-3 text-blue-700" />
            Detailed Description
          </h2>
          <div className="flex-grow bg-gray-50 p-6 rounded-lg text-gray-700 text-lg leading-relaxed border border-gray-200">
            <p>{ticket.description || "No description provided."}</p>
          </div>

          <h2 className="text-2xl font-bold text-blue-700 mt-8 mb-6 pb-4 border-b border-gray-200">
            <FaPaperclip className="inline-block mr-3 text-blue-700" />
            Attachments
          </h2>
          {renderAttachment()}
        </div>
      </div>

      <div className="mt-9 bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-blue-700 mb-6 pb-4 border-b border-gray-200">
          <FaInfoCircle className="inline-block mr-3 text-blue-700" />
          Ticket Notes
        </h2>

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
