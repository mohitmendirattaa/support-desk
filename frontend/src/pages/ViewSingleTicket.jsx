import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getSingleTicketAsAdmin, reset } from "../features/tickets/ticketSlice";
import Spinner from "../components/Spinner";
import BackButton from "../components/BackButton";
import {
  FaPencilAlt,
  FaTimesCircle,
  FaCalendarAlt,
  FaInfoCircle,
} from "react-icons/fa";

function ViewSingleTicket() {
  const { ticket, isLoading, isError, message } = useSelector(
    (state) => state.tickets
  );
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { ticketId } = useParams();
  const navigate = useNavigate();

  const getStatusClasses = (status) => {
    switch (status) {
      case "new":
        return "bg-blue-200 text-blue-800";
      case "open":
        return "bg-green-200 text-green-800";
      case "closed":
        return "bg-red-200 text-red-800";
      case "pending":
        return "bg-yellow-200 text-yellow-800";
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

    if (!user) {
      navigate("/login");
    } else if (user.role !== "admin") {
      toast.error("You are not authorized to view this page.");
      navigate("/admin-dashboard");
    } else {
      dispatch(getSingleTicketAsAdmin(ticketId));
    }

    return () => {
      dispatch(reset());
    };
  }, [ticketId, user, isError, message, dispatch, navigate]);

  if (isLoading) {
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
  console.log(ticket.user);
  return (
    // The pb-16 class provides padding-bottom for the gap.
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-gray-100 pb-24">
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
            <FaInfoCircle className="inline-block mr-3 text-blue-700" />
            Notes
          </h2>
          <div className="text-gray-500 italic bg-gray-50 p-6 rounded-lg border border-gray-200">
            No internal notes or updates available for this ticket yet.
          </div>
        </div>
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