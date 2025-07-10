import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getSingleTicketAsAdmin,
  reset,
  updateTicketStatus,
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

  // State for dropdown visibility
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // States for the confirmation modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusToUpdate, setStatusToUpdate] = useState("");
  const [reason, setReason] = useState("");

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
        return "bg-teal-200 text-teal-800";
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
      navigate("/admin-dashboard");
    } else {
      dispatch(getSingleTicketAsAdmin(ticketId));
      dispatch(getNotes(ticketId));
    }

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

  // This function now *opens the modal* instead of dispatching directly
  const handleStatusUpdate = (newStatus) => {
    setIsDropdownOpen(false); // Close the status dropdown
    setStatusToUpdate(newStatus); // Set the status that needs to be updated
    setReason(""); // Clear any previous reason
    setShowStatusModal(true); // Show the modal
  };

  // This function is called when the user confirms the update from the modal
  const confirmStatusUpdate = () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason for the status change.");
      return;
    }

    dispatch(
      updateTicketStatus({ ticketId, newStatus: statusToUpdate, reason })
    ) // Pass the reason here
      .unwrap()
      .then(() => {
        toast.success(`Ticket status updated to "${statusToUpdate}"!`);
        setShowStatusModal(false); // Close modal on success
        // If status becomes closed or resolved, navigate to tickets list
        if (statusToUpdate === "closed" || statusToUpdate === "resolved") {
          navigate("/admin-dashboard/tickets");
        }
      })
      .catch((error) => {
        toast.error(
          error.message || `Failed to update ticket to ${statusToUpdate}.`
        );
        setShowStatusModal(false); // Close modal on error too
      });
  };

  const closeStatusModal = () => {
    setShowStatusModal(false);
    setReason(""); // Clear reason when closing
    setStatusToUpdate(""); // Clear status when closing
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
        attachmentMimeType === "application/msword";

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
      return (
        <div className="mt-4 p-4 bg-yellow-100 rounded-lg border border-yellow-200 text-yellow-800">
          <p className="font-semibold flex items-center gap-2">
            <FaInfoCircle /> Attachment found, but type/name missing from
            backend.
          </p>
          <p className="text-sm mt-1">
            <a
              href={`data:application/octet-stream;base64,${attachment}`}
              download="attachment_unknown_type"
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

  const isTicketClosed = ticket.status === "closed";
  const isTicketResolved = ticket.status === "resolved";

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-gray-50 pb-24">
      <header className="flex justify-between items-center mb-8">
        <BackButton url="/admin-dashboard/tickets" />
        <h1 className="text-4xl font-extrabold text-blue-800 tracking-tight text-center flex-grow">
          {ticket.service || "Support"} Ticket
        </h1>
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
                {!isTicketResolved && !isTicketClosed && (
                  <button
                    onClick={() => handleStatusUpdate("resolved")}
                    className="block w-full text-left px-4 py-2 text-teal-700 hover:bg-teal-50"
                  >
                    Resolve
                  </button>
                )}
                {!isTicketClosed && (
                  <button
                    onClick={() => handleStatusUpdate("closed")}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                  >
                    Close
                  </button>
                )}
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

      {/* Status Update Confirmation Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-blue-800 mb-4 flex items-center">
              <FaPencilAlt className="mr-2" /> Confirm Status Change
            </h3>
            <p className="text-gray-700 mb-6">
              You are about to change the ticket status to{" "}
              <span className="font-semibold text-indigo-700">
                "{statusToUpdate.toUpperCase()}"
              </span>
              . Please provide a reason for this change:
            </p>
            <div className="mb-6">
              <label
                htmlFor="reason"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Reason:
              </label>
              <textarea
                id="reason"
                className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-28 resize-none"
                placeholder="E.g., Issue resolved, waiting for user response, escalated to L2 support, etc."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              ></textarea>
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={closeStatusModal}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusUpdate}
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors"
              >
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}
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
