import React from "react";
import {
  FaSignOutAlt,
  FaUsers,
  FaTicketAlt,
  FaChartBar,
  FaCog,
} from "react-icons/fa"; // Removed FaUserShield
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout, reset } from "../features/auth/authSlice";

function AdminHeader() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate("/login"); // Redirect to login page after logout
  };

  return (
    <header className="bg-gray-900 shadow-2xl py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center fixed top-0 left-0 w-full z-20 border-b-4 border-purple-700">
      <div className="logo flex items-center flex-shrink-0">
        {/* Existing SVG Logo */}
        <svg
          className="mr-2 h-8 w-8 sm:h-10 sm:w-10 text-blue-400" // Smaller on mobile, larger on sm+
          fill="currentColor"
          viewBox="0 0 1542 1542"
          xmlns="http://www.w3.org/2000/svg"
        >
          <style>{`.a{fill:#2d2b7c}.b{fill:#f7f7fa}`}</style>
          <path
            fillRule="evenodd"
            className="a"
            d="m648.8 2.9q677.7-41.4 879.5 600.1 94.9 624.3-470.8 891.5-670.8 194.9-1000.1-415.5-203.5-608.8 319-974.4 134.5-65.5 272.4-101.7z"
          />
          <path
            fillRule="evenodd"
            className="b"
            d="m935.1 547.8q29.3-3.4 55.2 6.9-82.8 55.2-136.3 136.3 74.2 110.3 143.2 225.9 98.3-238 320.7-369.1 13.8 3.5 25.9 6.9-279.4 234.5-339.7 600.1-25.9 13.8-48.3-6.9-67.3-187.9-177.6-355.2-89.7 174.2-129.4 369-25.8 3.5-46.5-13.8-113.8-351.8-401.8-579.4 87.9-13.8 175.9 0 162.1 150 258.6 348.4 43.2-93.2 96.6-177.7-79.3-96.5-177.6-170.7 158.6-43.1 265.6 74.2 63.8-44.9 115.5-94.9z"
          />
        </svg>
        {/* Changed text from "Support Desk" to "Admin Dashboard" */}
        <Link
          to={"/admin-dashboard"}
          className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-purple-400 hover:text-purple-300 transition-colors duration-300 tracking-wide"
        >
          Admin Dashboard
        </Link>
      </div>

      <ul className="flex space-x-2 sm:space-x-4 lg:space-x-6 items-center">
        {user &&
          user.role === "admin" && ( // Ensure only admin sees these links
            <>
              <li>
                <Link
                  to={"/admin-dashboard"}
                  className="flex items-center text-gray-300 hover:text-purple-400 font-semibold transition-colors duration-300 text-sm sm:text-base"
                >
                  <FaChartBar className="mr-1 sm:mr-2 text-purple-400 text-lg sm:text-xl" />
                  <span className="hidden sm:inline-block">Dashboard</span>
                  <span className="inline-block sm:hidden">Dash</span>
                </Link>
              </li>
              <li>
                {/* Example: Link to a user management section */}
                <Link
                  to={"/admin-dashboard/users"}
                  className="flex items-center text-gray-300 hover:text-purple-400 font-semibold transition-colors duration-300 text-sm sm:text-base"
                >
                  <FaUsers className="mr-1 sm:mr-2 text-purple-400 text-lg sm:text-xl" />
                  <span className="hidden sm:inline-block">Users</span>
                  <span className="inline-block sm:hidden">Users</span>
                </Link>
              </li>
              <li>
                {/* Example: Link to admin ticket view */}
                <Link
                  to={"/admin-dashboard/tickets"}
                  className="flex items-center text-gray-300 hover:text-purple-400 font-semibold transition-colors duration-300 text-sm sm:text-base"
                >
                  <FaTicketAlt className="mr-1 sm:mr-2 text-purple-400 text-lg sm:text-xl" />
                  <span className="hidden sm:inline-block">Tickets</span>
                  <span className="inline-block sm:hidden">Tix</span>
                </Link>
              </li>
              <li>
                {/* Example: Link to admin settings */}
                <Link
                  to={"/admin-dashboard/settings"}
                  className="flex items-center text-gray-300 hover:text-purple-400 font-semibold transition-colors duration-300 text-sm sm:text-base"
                >
                  <FaCog className="mr-1 sm:mr-2 text-purple-400 text-lg sm:text-xl" />
                  <span className="hidden sm:inline-block">Settings</span>
                  <span className="inline-block sm:hidden">Set</span>
                </Link>
              </li>
              <li>
                <button
                  onClick={onLogout}
                  className="px-3 py-1 sm:px-5 sm:py-2 bg-gradient-to-br from-red-600 to-red-800 text-white font-semibold rounded-lg shadow-lg hover:from-red-700 hover:to-red-900 transition-all transform hover:scale-105 duration-300 ease-in-out flex items-center text-xs sm:text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
                >
                  <FaSignOutAlt className="mr-1 text-base sm:mr-2 sm:text-lg" />
                  <span className="hidden md:inline-block">Logout</span>
                  <span className="inline-block md:hidden">Out</span>
                </button>
              </li>
            </>
          )}
      </ul>
    </header>
  );
}

export default AdminHeader;
