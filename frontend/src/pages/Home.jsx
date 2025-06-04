import React from "react";
import { Link } from "react-router-dom"; 
import { FaQuestionCircle, FaTicketAlt } from "react-icons/fa";

function Home() {
  return (
    <div className="min-h-[95vh] flex items-center justify-center bg-gray-50 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100">
        <section className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
            What do you need help with?
          </h1>
          <p className="text-lg sm:text-xl text-gray-600">
            Please choose an option below
          </p>
        </section>

        <Link
          to={"/new-ticket"}
          className="w-full flex items-center justify-center px-6 py-4 mb-4
                     bg-gradient-to-r from-indigo-600 to-purple-700 text-white
                     font-semibold text-lg rounded-xl shadow-lg
                     hover:from-indigo-700 hover:to-purple-800
                     transform hover:-translate-y-1 transition duration-300 ease-in-out
                     focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50"
        >
          <FaQuestionCircle className="mr-3 h-6 w-6" />
          Create new ticket
        </Link>
        <Link
          to={"/tickets"}
          className="w-full flex items-center justify-center px-6 py-4
                     bg-gradient-to-r from-gray-700 to-gray-900 text-white
                     font-semibold text-lg rounded-xl shadow-lg
                     hover:from-gray-800 hover:to-gray-950
                     transform hover:-translate-y-1 transition duration-300 ease-in-out
                     focus:outline-none focus:ring-4 focus:ring-gray-600 focus:ring-opacity-50"
        >
          <FaTicketAlt className="mr-3 h-6 w-6" />
          View my tickets
        </Link>
      </div>
    </div>
  );
}

export default Home;
