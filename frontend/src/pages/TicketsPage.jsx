// src/pages/TicketsPage.jsx
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getAllTicketsForAdmin,
  deleteTicket,
  reset,
} from "../features/tickets/ticketSlice";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import TicketsTable from "../components/admin-ticket-page-components/TicketsTable";
import PaginationControls from "../components/admin-ticket-page-components/PaginationControls";
import TicketFilterSearchBar from "../components/admin-ticket-page-components/TicketFilterSearchBar";
import { Trash2, CalendarSearch } from "lucide-react";
import DeleteConfirmationModal from "../components/admin-ticket-page-components/DeleteConfirmationModal";
import TicketsPageHeader from "../components/admin-ticket-page-components/TicketsPageHeader";
import NoTicketsFoundMessage from "../components/admin-ticket-page-components/NoTicketsFoundMessage";
import {
  TicketIcon,
  UserIcon,
} from "../components/admin-ticket-page-components/Icons";

import AdvancedSearchModal from "../components/admin-ticket-page-components/AdvancedSearchModal";

function TicketsPage() {
  const dispatch = useDispatch();
  const { tickets, isLoading, isError, message } = useSelector(
    (state) => state.tickets
  );
  const { user } = useSelector((state) => state.auth);

  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 10;

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [selectedTicketIds, setSelectedTicketIds] = useState(new Set());

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [idsToDelete, setIdsToDelete] = useState([]);

  const [isAdvancedSearchModalOpen, setIsAdvancedSearchModalOpen] =
    useState(false);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  useEffect(() => {
    dispatch(reset());

    if (user && user.role === "admin") {
      dispatch(getAllTicketsForAdmin());
    } else if (!user) {
      console.error("User not logged in or not authorized to view this page.");
    } else if (user && user.role !== "admin") {
      console.error(
        "You do not have administrative privileges to view all tickets."
      );
    }

    if (isError) {
      toast.error(message);
    }

    return () => {
      dispatch(reset());
      setSelectedTicketIds(new Set());
    };
  }, [dispatch, user, isError, message]);

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearchTerm = searchTerm
      ? (ticket.id ? String(ticket.id).toLowerCase() : "").includes(
          searchTerm.toLowerCase()
        )
      : true;

    const matchesStatus =
      filterStatus === "all" ||
      (ticket.status ? ticket.status.toLowerCase() : "") ===
        filterStatus.toLowerCase();

    const matchesPriority =
      filterPriority === "all" ||
      (ticket.priority ? ticket.priority.toLowerCase() : "") ===
        filterPriority.toLowerCase();

    const ticketDate = ticket.createdAt ? new Date(ticket.createdAt) : null;
    const fromDate = dateRange.from ? new Date(dateRange.from) : null;
    const toDate = dateRange.to ? new Date(dateRange.to) : null;

    const matchesDateRange =
      (!fromDate || (ticketDate && ticketDate >= fromDate)) &&
      (!toDate || (ticketDate && ticketDate <= toDate));

    return (
      matchesSearchTerm && matchesStatus && matchesPriority && matchesDateRange
    );
  });

  useEffect(() => {
    setCurrentPage(1);
    setSelectedTicketIds(new Set());
  }, [searchTerm, filterStatus, filterPriority, dateRange]);

  const handleSelectTicket = (ticketId, isChecked) => {
    setSelectedTicketIds((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (isChecked) {
        newSelected.add(ticketId);
      } else {
        newSelected.delete(ticketId);
      }
      return newSelected;
    });
  };

  const handleSelectAllTickets = (isChecked) => {
    setSelectedTicketIds((prevSelected) => {
      const newSelected = new Set(prevSelected);
      currentTickets.forEach((ticket) => {
        if (isChecked) {
          newSelected.add(ticket.id);
        } else {
          newSelected.delete(ticket.id);
        }
      });
      return newSelected;
    });
  };

  const handleDeleteTicket = (ticketId) => {
    setIdsToDelete([ticketId]);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSelected = () => {
    if (selectedTicketIds.size === 0) {
      toast.info("Please select at least one ticket to delete.");
      return;
    }
    setIdsToDelete(Array.from(selectedTicketIds));
    setIsDeleteModalOpen(true);
  };

  const confirmDeletion = async () => {
    setIsDeleteModalOpen(false);

    const results = await Promise.allSettled(
      idsToDelete.map((id) => dispatch(deleteTicket(id)).unwrap())
    );

    const successfullyDeleted = results.filter(
      (res) => res.status === "fulfilled"
    ).length;
    const failedToDelete = results.filter(
      (res) => res.status === "rejected"
    ).length;

    if (successfullyDeleted > 0) {
      toast.success(`Successfully deleted ${successfullyDeleted} ticket(s)!`);
    }
    if (failedToDelete > 0) {
      toast.error(
        `Failed to delete ${failedToDelete} ticket(s). Check console for details.`
      );
      results
        .filter((res) => res.status === "rejected")
        .forEach((res) => console.error("Deletion failed:", res.reason));
    }

    setSelectedTicketIds(new Set());
    setIdsToDelete([]);
  };

  const handleAdvancedSearch = (dates) => {
    setDateRange(dates);
    setIsAdvancedSearchModalOpen(false);
    setCurrentPage(1);
    toast.info("Advanced search applied!");
  };

  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = filteredTickets.slice(
    indexOfFirstTicket,
    indexOfLastTicket
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);

  if (!user || user.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 font-sans">
        <div className="bg-white p-8 rounded-lg shadow-md text-center w-full max-w-md">
          <TicketIcon className="text-red-500 text-6xl mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 text-lg">
            You must be an administrator to view this page.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <Spinner />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 font-sans">
        <div className="bg-white p-8 rounded-lg shadow-md text-center w-full max-w-md">
          <TicketIcon className="text-red-500 text-6xl mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Error!</h1>
          <p className="text-gray-600 text-lg">
            {message || "Failed to fetch tickets."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-0 px-4 font-sans">
      <div className="mx-auto py-4">
        <TicketsPageHeader TicketIcon={TicketIcon} />

        {/* This is the main filter/search line */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
          {/* Wrapper for Search Bar */}
          <div className="flex-grow min-w-0">
            <TicketFilterSearchBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onClearSearch={() => setSearchTerm("")}
            />
          </div>

          {/* Wrapper for Filter Dropdowns and Advanced Search Button */}
          <div className="flex flex-col sm:flex-row gap-4 flex-shrink-0">
            {/* Status Filter Dropdown */}
            <div className="relative inline-block text-left w-full sm:w-auto">
              <label htmlFor="status-filter" className="sr-only">
                Filter by Status
              </label>
              <select
                id="status-filter"
                name="status-filter"
                className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="resolved">Resolved</option>
                <option value="pending">Pending</option>
                <option value="reopen">Reopen</option>
                <option value="hold">Hold</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Priority Filter Dropdown */}
            <div className="relative inline-block text-left w-full sm:w-auto">
              <label htmlFor="priority-filter" className="sr-only">
                Filter by Priority
              </label>
              <select
                id="priority-filter"
                name="priority-filter"
                className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Advanced Search Button */}
            <button
              onClick={() => setIsAdvancedSearchModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out w-full sm:w-auto justify-center"
            >
              <CalendarSearch size={20} className="mr-2" /> Advanced Search
            </button>
          </div>
        </div>

        {/* Delete Selected Button */}
        {selectedTicketIds.size > 0 && (
          <button
            onClick={handleDeleteSelected}
            className="mb-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
          >
            <Trash2 size={20} className="mr-2" /> Delete Selected (
            {selectedTicketIds.size})
          </button>
        )}

        {/* Conditional rendering for no tickets found vs. tickets table */}
        {filteredTickets.length === 0 ? (
          <NoTicketsFoundMessage
            searchTerm={searchTerm}
            TicketIcon={TicketIcon}
          />
        ) : (
          <TicketsTable
            currentTickets={currentTickets}
            UserIcon={UserIcon}
            onDelete={handleDeleteTicket}
            selectedTicketIds={selectedTicketIds}
            onSelectTicket={handleSelectTicket}
            onSelectAllTickets={handleSelectAllTickets}
          />
        )}

        {/* Pagination Controls - now below the table */}
        {totalPages > 1 && (
          <div className="mt-4 **w-full**">
            {" "}
            {/* Removed flex justify-center, added w-full */}
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              paginate={paginate}
              indexOfFirstTicket={indexOfFirstTicket}
              indexOfLastTicket={indexOfLastTicket}
              totalTickets={filteredTickets.length}
            />
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeletion}
        count={idsToDelete.length}
      />

      {/* Advanced Search Modal */}
      <AdvancedSearchModal
        isOpen={isAdvancedSearchModalOpen}
        onClose={() => setIsAdvancedSearchModalOpen(false)}
        onSearch={handleAdvancedSearch}
        initialDateRange={dateRange}
      />
    </div>
  );
}

export default TicketsPage;
