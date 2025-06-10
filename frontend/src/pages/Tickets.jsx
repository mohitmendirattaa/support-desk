import React, { useEffect, useState } from "react"; // Import useState
import { useDispatch, useSelector } from "react-redux";
import { getTickets } from "../features/tickets/ticketSlice";
import Spinner from "../components/Spinner";
import BackButton from "../components/BackButton";
import TicketItem from "../components/TicketItem";

function Tickets() {
  const { tickets, isLoading, isError, message } = useSelector(
    (state) => state.tickets
  );
  const dispatch = useDispatch();

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Number of tickets to display per page

  useEffect(() => {
    if (isError) {
      console.error(message);
    }
    // Fetch tickets when the component mounts or dependencies change
    dispatch(getTickets());
  }, [dispatch, isError, message]);

  // Calculate the tickets to display on the current page
  const indexOfLastTicket = currentPage * itemsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - itemsPerPage;
  const currentTickets = tickets.slice(indexOfFirstTicket, indexOfLastTicket);

  // Calculate total pages for pagination controls
  const totalPages = Math.ceil(tickets.length / itemsPerPage);

  // Function to change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Functions to navigate to next/previous page
  const nextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  if (isLoading) {
    return <Spinner />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] bg-red-50 text-red-700 p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Error Loading Tickets</h2>
        <p className="text-lg">
          {message || "Something went wrong. Please try again."}
        </p>
        <BackButton />
      </div>
    );
  }

  if (!tickets || tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] bg-blue-50 text-blue-700 p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">No Tickets Found</h2>
        <p className="text-lg">You haven't created any tickets yet.</p>
        <button
          onClick={() => dispatch(getTickets())}
          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
        <BackButton />
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-gray-50">
        <header className="flex justify-between items-center mb-8">
          <BackButton />
          <h1 className="text-4xl font-extrabold text-blue-800 tracking-tight text-center flex-grow">
            My Support Tickets
          </h1>
          <div className="w-auto opacity-0">
            <BackButton />
          </div>
        </header>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-8 p-4 lg:p-6 border-b border-gray-200 bg-blue-50 font-semibold text-blue-700 text-sm uppercase">
            <div className="hidden md:block">Priority</div>
            <div className="hidden md:block">Start Date</div>
            <div className="hidden md:block">End Date</div>
            <div className="hidden md:block">Category</div>
            <div className="hidden md:block">Sub-Category</div>
            <div className="hidden md:block">Status</div>
            <div className="hidden md:block"></div>
          </div>

          <div className="divide-y divide-gray-100">
            {currentTickets.map((ticket) => (
              <TicketItem ticket={ticket} key={ticket.id} />
            ))}
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8 pb-8">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Previous
            </button>
            {/* Render page number buttons */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => paginate(page)}
                className={`px-4 py-2 rounded-lg font-medium
                  ${
                    currentPage === page
                      ? "bg-blue-800 text-white"
                      : "bg-blue-200 text-blue-800 hover:bg-blue-300"
                  } transition-colors`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default Tickets;
