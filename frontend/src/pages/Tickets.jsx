// src/pages/Tickets.jsx
import React, { useEffect } from "react";
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

  useEffect(() => {
    if (isError) {
      console.error(message);
    }
    dispatch(getTickets());
  }, [dispatch, isError, message]);

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
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
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
          {/* UPDATED: Changed grid to md:grid-cols-7 and added an empty div */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4 p-4 lg:p-6 border-b border-gray-200 bg-blue-50 font-semibold text-blue-700 text-sm uppercase">
            <div className="hidden md:block">Priority</div>
            <div className="hidden md:block">Start Date</div>
            <div className="hidden md:block">End Date</div>
            <div className="hidden md:block">Category</div>
            <div className="hidden md:block">Sub-Category</div>
            <div className="hidden md:block">Status</div>
            <div className="hidden md:block"></div>
          </div>

          <div className="divide-y divide-gray-100">
            {tickets.map((ticket) => (
              <TicketItem ticket={ticket} key={ticket._id} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Tickets;
