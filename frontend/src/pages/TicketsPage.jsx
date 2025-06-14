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
import { Trash2 } from "lucide-react";
import DeleteConfirmationModal from "../components/admin-ticket-page-components/DeleteConfirmationModal";
import TicketsPageHeader from "../components/admin-ticket-page-components/TicketsPageHeader";
import NoTicketsFoundMessage from "../components/admin-ticket-page-components/NoTicketsFoundMessage";
import { TicketIcon, UserIcon } from "../components/admin-ticket-page-components/Icons";

function TicketsPage() {
  const dispatch = useDispatch();
  const { tickets, isLoading, isError, message } = useSelector(
    (state) => state.tickets
  );
  const { user } = useSelector((state) => state.auth);

  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 10;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTicketIds, setSelectedTicketIds] = useState(new Set());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [idsToDelete, setIdsToDelete] = useState([]);

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
    if (!searchTerm) {
      return true;
    }
    const ticketIdToFilter = ticket.id ? String(ticket.id).toLowerCase() : "";
    return ticketIdToFilter.includes(searchTerm.toLowerCase());
  });

  useEffect(() => {
    setCurrentPage(1);
    setSelectedTicketIds(new Set());
  }, [searchTerm]);

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
    setIsModalOpen(true);
  };

  const handleDeleteSelected = () => {
    if (selectedTicketIds.size === 0) {
      toast.info("Please select at least one ticket to delete.");
      return;
    }
    setIdsToDelete(Array.from(selectedTicketIds));
    setIsModalOpen(true);
  };

  const confirmDeletion = async () => {
    setIsModalOpen(false);

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
    <div className="min-h-screen bg-gray-50 pt-0 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6">
        <TicketsPageHeader TicketIcon={TicketIcon} />

        <TicketFilterSearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onClearSearch={() => setSearchTerm("")}
        />

        {selectedTicketIds.size > 0 && (
          <button
            onClick={handleDeleteSelected}
            className="mb-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
          >
            <Trash2 size={20} className="mr-2" /> Delete Selected (
            {selectedTicketIds.size})
          </button>
        )}

        {filteredTickets.length === 0 ? (
          <NoTicketsFoundMessage
            searchTerm={searchTerm}
            TicketIcon={TicketIcon}
          />
        ) : (
          <>
            <TicketsTable
              currentTickets={currentTickets}
              UserIcon={UserIcon}
              onDelete={handleDeleteTicket}
              selectedTicketIds={selectedTicketIds}
              onSelectTicket={handleSelectTicket}
              onSelectAllTickets={handleSelectAllTickets}
            />

            {totalPages > 1 && (
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                paginate={paginate}
                indexOfFirstTicket={indexOfFirstTicket}
                indexOfLastTicket={indexOfLastTicket}
                totalTickets={filteredTickets.length}
              />
            )}
          </>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDeletion}
        count={idsToDelete.length}
      />
    </div>
  );
}

export default TicketsPage;
