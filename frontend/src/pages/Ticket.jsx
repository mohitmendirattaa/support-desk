import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  FaRedo,
  FaCalendarAlt,
  FaInfoCircle,
  FaPaperclip,
  FaFilePdf,
  FaFileWord,
  FaFileAlt,
  // FaPlus, // Removed as direct note adding is removed
  FaUserCircle, // For user avatar in notes
  FaIdBadge, // For staff avatar in notes
} from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { getTicket } from "../features/tickets/ticketSlice";
import {
  getNotes,
  // createNote, // Removed as direct note adding is removed
  reopenTicket,
  reset as resetNotes,
} from "../features/notes/noteSlice";
import { useParams, useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import BackButton from "../components/BackButton";
import Modal from "../components/Modal";

function Ticket() {
  const { ticket, isLoading, isError, message } = useSelector(
    (state) => state.tickets
  );
  const {
    notes,
    isLoading: isLoadingNotes,
    isError: isErrorNotes,
    message: notesMessage,
  } = useSelector((state) => state.notes);
  // const { user } = useSelector((state) => state.auth); // No longer directly used here for note authoring, but keep if user role needed elsewhere

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { ticketId } = useParams();

  // State for the reopen modal
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenReason, setReopenReason] = useState("");
  const [isReopening, setIsReopening] = useState(false); // To show spinner for reopen action

  // Removed state for new note input as direct note adding is removed
  // const [newNoteText, setNewNoteText] = useState("");
  // const [isAddingNote, setIsAddingNote] = useState(false); // To show spinner for adding note

  const getStatusClasses = (status) => {
    switch (status) {
      case "new":
        return "bg-blue-200 text-blue-800";
      case "open":
        return "bg-green-200 text-green-800";
      case "closed":
        return "bg-red-200 text-red-800";
      case "reopened":
        return "bg-purple-200 text-purple-800";
      case "resolved":
        return "bg-yellow-200 text-yellow-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
    if (isErrorNotes) {
      toast.error(notesMessage);
    }

    // Fetch the ticket details
    dispatch(getTicket(ticketId))
      .unwrap()
      .catch((error) => {
        toast.error(error.message || "Failed to load ticket details.");
        navigate("/tickets");
      });

    // Fetch notes for the ticket
    dispatch(getNotes(ticketId));

    // Cleanup on unmount
    return () => {
      dispatch(resetNotes()); // Reset notes state when leaving the ticket page
    };
  }, [
    ticketId,
    dispatch,
    isError,
    message,
    navigate,
    isErrorNotes,
    notesMessage,
  ]);

  // Handler for 'Re-open Ticket' button click
  const handleReopenClick = () => {
    setShowReopenModal(true);
  };

  // Handler for submitting the reopen reason
  const handleReopenSubmit = async () => {
    if (!reopenReason.trim()) {
      toast.error("Please provide a reason for reopening the ticket.");
      return;
    }

    setIsReopening(true); // Start loading state for reopen action

    try {
      // Dispatch the reopenTicket action from noteSlice
      // The backend should handle creating the note with this reopenReason
      await dispatch(reopenTicket({ ticketId, reopenReason })).unwrap();
      toast.success("Ticket successfully reopened!");
      setShowReopenModal(false); // Close the modal
      setReopenReason(""); // Clear the reason
      // Re-fetch the ticket and notes to get the updated status and the new reopening note
      dispatch(getTicket(ticketId));
      dispatch(getNotes(ticketId)); // Re-fetch notes to show the newly added reopen note
    } catch (error) {
      toast.error(error || "Failed to reopen ticket.");
    } finally {
      setIsReopening(false); // End loading state
    }
  };

  // Handler for closing the reopen modal
  const handleCloseReopenModal = () => {
    setShowReopenModal(false);
    setReopenReason(""); // Clear any entered reason
  };

  // Removed handler for adding a new note as direct note adding is removed
  // const handleAddNote = async (e) => { ... };

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
          {ticket.attachmentSize !== null && (
            <p className="text-sm text-gray-500 mt-1">
              File Size: {(ticket.attachmentSize / 1024).toFixed(2)} KB (
              {(ticket.attachmentSize / (1024 * 1024)).toFixed(2)} MB)
            </p>
          )}
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
              download="attachment"
              className="text-blue-600 hover:underline flex items-center"
            >
              <FaFileAlt className="mr-1" /> Download Generic File
            </a>
          </p>
          {ticket.attachmentSize !== null && (
            <p className="text-sm text-gray-500 mt-1">
              File Size: {(ticket.attachmentSize / 1024).toFixed(2)} KB (
              {(ticket.attachmentSize / (1024 * 1024)).toFixed(2)} MB)
            </p>
          )}
        </div>
      );
    }
    return (
      <div className="text-gray-500 italic bg-gray-50 p-6 rounded-lg border border-gray-200">
        No attachment for this ticket.
      </div>
    );
  };

  if (isLoading || isLoadingNotes || isReopening /* Removed isAddingNote */) {
    return <Spinner />;
  }

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

  if (!ticket || !ticket.id) {
    // This case should ideally be handled by isError, but as a fallback
    return <Spinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-gray-50">
      {/* Page Header */}
      <header className="flex justify-between items-center mb-8">
        <BackButton />
        <h1 className="text-4xl font-extrabold text-blue-800 tracking-tight text-center flex-grow">
          {ticket.ServiceType} Ticket
        </h1>
        <div className="w-auto opacity-0">
          <BackButton />
        </div>
      </header>
      {/* Ticket ID, Status, and Submission Date */}
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
          {/* Re-open Ticket button, conditionally rendered if ticket is closed or resolved */}
          {(ticket.status === "closed" || ticket.status === "resolved") && (
            <button
              onClick={handleReopenClick}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
            >
              <FaRedo /> Re-open Ticket
            </button>
          )}
        </div>
      </header>
      {/* Main Content Grid */}
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Issue Overview Section (Original first column) */}
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
              highlight={true} // Priority highlight logic still applies
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

        {/* Detailed Description and Attachments Section (Original second column) */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 flex flex-col">
          <h2 className="text-2xl font-bold text-blue-700 mb-4 pb-4 border-b border-gray-200">
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
      ---
      {/* --- Notes Section --- */}
      {/* Removed the "Add a New Note" form */}
      <div className="mt-12 bg-white rounded-xl shadow-lg border border-gray-100 p-8">
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
      {/* Reopen Ticket Modal (remains same) */}
      <Modal show={showReopenModal} onClose={handleCloseReopenModal}>
        <h2 className="text-2xl font-bold mb-4 text-blue-700">
          Reopen Ticket #{ticket.id.toUpperCase()}
        </h2>
        <p className="mb-4 text-gray-700">
          Please provide a detailed reason why you are reopening this ticket.
        </p>
        <textarea
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-y min-h-[100px]"
          placeholder="e.g., The issue was not fully resolved, the problem has reoccurred, etc."
          value={reopenReason}
          onChange={(e) => setReopenReason(e.target.value)}
        ></textarea>
        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={handleCloseReopenModal}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            disabled={isReopening}
          >
            Cancel
          </button>
          <button
            onClick={handleReopenSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={isReopening}
          >
            {isReopening ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Reopening...
              </>
            ) : (
              "Submit Reopen Request"
            )}
          </button>
        </div>
      </Modal>
    </div>
  );
}

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
