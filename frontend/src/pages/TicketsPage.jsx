// src/pages/TicketsPage.jsx
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getAllTicketsForAdmin, reset } from "../features/tickets/ticketSlice";
import Spinner from "../components/Spinner";
// Update import paths based on your structure
import TicketsTable from "../components/admin-ticket-page-components/TicketsTable";
import PaginationControls from "../components/admin-ticket-page-components/PaginationControls";
import TicketFilterSearchBar from "../components/admin-ticket-page-components/TicketFilterSearchBar"; // Import the new component

function TicketsPage() {
  const dispatch = useDispatch();
  const { tickets, isLoading, isError, message } = useSelector(
    (state) => state.tickets
  );
  const { user } = useSelector((state) => state.auth);

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 10; // Number of tickets to display per page

  // State for search term (ticket ID) - now managed in TicketsPage
  const [searchTerm, setSearchTerm] = useState("");

  // Inline SVG for Ticket Icon
  const TicketIcon = ({ className }) => (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        d="M14.5 3.235V3h-.104c-1.425 0-2.852.124-4.276.368-1.417.243-2.834.61-4.238 1.13-1.4.52-2.784 1.18-4.148 1.95V3h-.104C1.942 3 1 3.942 1 5.096V17h18V5.096c0-1.154-.942-2.096-2.096-2.096zM3 15V7.473c1.077-.423 2.18-.756 3.308-.99 1.127-.234 2.26-.35 3.39-.35h.004c1.13 0 2.263.116 3.39.35 1.128.234 2.231.567 3.308.99V15H3zM15 11.5a.5.5 0 01-.5.5h-9a.5.5 0 010-1h9a.5.5 0 01.5.5z"
        clipRule="evenodd"
      ></path>
    </svg>
  );

  // Inline SVG for User Icon (reused for consistent styling)
  const UserIcon = ({ className }) => (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
        clipRule="evenodd"
      ></path>
    </svg>
  );

  // Effect to fetch tickets when component mounts or user/dispatch changes
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

    return () => {
      dispatch(reset());
    };
  }, [dispatch, user]);

  // --- Filtering Logic for Ticket ID ---
  const filteredTickets = tickets.filter((ticket) => {
    if (!searchTerm) {
      return true;
    }

    // Using 'ticket.id' as the property for ticket ID
    const ticketIdToFilter = ticket.id ? String(ticket.id).toLowerCase() : "";

    return ticketIdToFilter.includes(searchTerm.toLowerCase());
  });
  // --- End Filtering Logic ---

  // Reset pagination to 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Calculate tickets for the current page for pagination
  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = filteredTickets.slice(
    indexOfFirstTicket,
    indexOfLastTicket
  );

  // Function to change current page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Calculate total number of pages for pagination
  const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);

  // Conditional rendering: Access Denied if not an admin
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

  // Conditional rendering: Show spinner while loading
  if (isLoading) {
    return <Spinner />;
  }

  // Conditional rendering: Show error message if an error occurred
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
        {/* Page Header Section */}
        <header className="flex flex-col sm:flex-row items-center justify-between mb-4 pb-2 border-b border-gray-200">
          <h1 className="text-4xl font-extrabold text-indigo-700 flex items-center mb-4 sm:mb-0">
            <TicketIcon className="mr-3 w-10 h-10 text-indigo-500" /> All
            Tickets (Admin View)
          </h1>
          <p className="text-lg text-gray-600">
            Overview of all user-generated tickets.
          </p>
        </header>

        {/* Search Input using the new component */}
        <TicketFilterSearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onClearSearch={() => setSearchTerm("")}
        />

        {/* Conditional rendering: No tickets found message */}
        {filteredTickets.length === 0 ? (
          <div className="text-center py-10">
            <TicketIcon className="text-gray-400 w-24 h-24 mx-auto mb-6" />
            <p className="text-2xl text-gray-700 font-semibold">
              {searchTerm
                ? "No tickets found matching your search."
                : "No tickets found."}
            </p>
            {!searchTerm && (
              <p className="text-md text-gray-500 mt-2">
                It seems no tickets have been raised yet.
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Tickets Table Section */}
            <TicketsTable currentTickets={currentTickets} UserIcon={UserIcon} />

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                paginate={paginate}
                indexOfFirstTicket={indexOfFirstTicket}
                indexOfLastTicket={indexOfLastTicket}
                totalTickets={filteredTickets.length} // Pass filtered count here
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default TicketsPage;
