import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getAllTicketsForAdmin, reset } from "../features/tickets/ticketSlice"; // Action to fetch all tickets for admin
import Spinner from "../components/Spinner"; // Spinner component for loading state
import AdminTicketItem from "../components/AdminTicketItem"; // Import the AdminTicketItem component

function TicketsPage() {
  const dispatch = useDispatch();
  // Destructure state from Redux store
  const { tickets, isLoading, isError, message } = useSelector(
    (state) => state.tickets
  );
  const { user } = useSelector((state) => state.auth);
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 10; // Number of tickets to display per page

  // Effect to fetch tickets when component mounts or user/dispatch changes
  useEffect(() => {
    // Reset ticket state when component mounts or unmounts
    dispatch(reset());

    // Check if user is logged in and has admin role before fetching tickets
    if (user && user.role === "admin") {
      dispatch(getAllTicketsForAdmin()); // Dispatch action to get all tickets for admin
    } else if (!user) {
      console.error("User not logged in or not authorized to view this page.");
    } else if (user && user.role !== "admin") {
      console.error(
        "You do not have administrative privileges to view all tickets."
      );
    }

    // Cleanup function to reset state when component unmounts
    return () => {
      dispatch(reset());
    };
  }, [dispatch, user]); // Dependencies for useEffect

  // Calculate tickets for the current page for pagination
  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = tickets.slice(indexOfFirstTicket, indexOfLastTicket);

  // Function to change current page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Inline SVG for Ticket Icon (reused for consistent styling)
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

  // Calculate total number of pages for pagination
  const totalPages = Math.ceil(tickets.length / ticketsPerPage);

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-xl p-6 sm:p-8">
        {/* Page Header Section */}
        <header className="flex flex-col sm:flex-row items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <h1 className="text-4xl font-extrabold text-indigo-700 flex items-center mb-4 sm:mb-0">
            <TicketIcon className="mr-3 w-10 h-10 text-indigo-500" /> All
            Tickets (Admin View)
          </h1>
          <p className="text-lg text-gray-600">
            Overview of all user-generated tickets.
          </p>
        </header>

        {/* Conditional rendering: No tickets found message */}
        {tickets.length === 0 ? (
          <div className="text-center py-10">
            <TicketIcon className="text-gray-400 w-24 h-24 mx-auto mb-6" />
            <p className="text-2xl text-gray-700 font-semibold">
              No tickets found.
            </p>
            <p className="text-md text-gray-500 mt-2">
              It seems no tickets have been raised yet.
            </p>
          </div>
        ) : (
          <>
            {/* Tickets Table Section */}
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-indigo-600 text-white">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider rounded-tl-lg"
                    >
                      Ticket ID
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    >
                      Category
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    >
                      Sub-Category
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    >
                      Priority
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider flex items-center"
                    >
                      <UserIcon className="mr-1 w-4 h-4" /> Raised By
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider rounded-tr-lg"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Map over currentTickets and render AdminTicketItem for each */}
                  {currentTickets.map((ticket) => (
                    <AdminTicketItem
                      key={ticket.id} // Ensure a unique key for each item
                      ticket={ticket} // Pass the ticket object as a prop
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <nav
                className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-lg shadow"
                aria-label="Pagination"
              >
                <div className="hidden sm:block">
                  <p className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">
                      {indexOfFirstTicket + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(indexOfLastTicket, tickets.length)}
                    </span>{" "}
                    of <span className="font-medium">{tickets.length}</span>{" "}
                    results
                  </p>
                </div>
                <div className="flex-1 flex justify-between sm:justify-end">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <div className="ml-3 flex space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (number) => (
                        <button
                          key={number}
                          onClick={() => paginate(number)}
                          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                            currentPage === number
                              ? "bg-indigo-600 text-white"
                              : "bg-white text-gray-700 hover:bg-gray-50"
                          } transition-colors`}
                        >
                          {number}
                        </button>
                      )
                    )}
                  </div>
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default TicketsPage;
