// UserManagement.jsx
import React, { useEffect, useState } from "react";
import { Users, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchAllUsers,
  resetUserManagement,
} from "../features/users/userSlice";
import { toast } from "react-toastify";
import UserItem from "../components/UserItem";

function UserManagement() {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);

  const { allUsers, isLoadingUsers, isErrorUsers, messageUsers } = useSelector(
    (state) => state.users
  );

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isErrorUsers) {
      toast.error(messageUsers);
    }

    if (user && user.token) {
      dispatch(fetchAllUsers());
    } else {
      dispatch(resetUserManagement());
      toast.error("Authentication token not found. Please log in.");
    }

    return () => {
      dispatch(resetUserManagement());
    };
  }, [dispatch, user, isErrorUsers, messageUsers]);

  // Filter users based on search term
  const filteredUsers = allUsers.filter((user) => {
    const searchLower = searchTerm.toLowerCase();

    // Safely access properties and convert to string before calling toLowerCase()
    const name = user.name ? String(user.name).toLowerCase() : "";
    const email = user.email ? String(user.email).toLowerCase() : "";
    const employeeCode = user.employeeCode
      ? String(user.employeeCode).toLowerCase()
      : "";
    const company = user.company ? String(user.company).toLowerCase() : "";
    const role = user.role ? String(user.role).toLowerCase() : "";
    const status = user.status ? String(user.status).toLowerCase() : "";

    return (
      name.includes(searchLower) ||
      email.includes(searchLower) ||
      employeeCode.includes(searchLower) ||
      company.includes(searchLower) ||
      role.includes(searchLower) ||
      status.includes(searchLower)
    );
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Reset pagination to 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (isLoadingUsers) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-10">
        <p className="text-lg text-gray-700">Loading users...</p>
      </div>
    );
  }

  if (isErrorUsers) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-10">
        <p className="text-lg text-red-600">Error: {messageUsers}</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-r from-green-600 to-teal-700 p-8 text-white text-center rounded-t-2xl flex items-center justify-center">
        <Users size={48} className="mr-4 opacity-90" />
        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
          User Management
        </h1>
      </div>

      <div className="p-4 sm:p-6 flex-1">
        {/* Search Input */}
        <div className="mb-6 flex items-center space-x-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by name, email, employee code, etc."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out text-gray-700 placeholder-gray-400"
            />
          </div>
          {/* You could add a 'Clear Search' button here if needed */}
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-150 ease-in-out"
            >
              Clear
            </button>
          )}
        </div>

        <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4 px-4 py-2 lg:px-6 lg:py-2 border-b border-gray-200 bg-gray-100 font-semibold text-gray-500 text-sm uppercase items-center">
            <div>Name</div>
            <div className="hidden md:block">Employee Code</div>
            <div className="hidden md:block">Company</div>
            <div className="hidden md:block">Role</div>
            <div className="hidden md:block">Registered On</div>
            <div>Status</div>
            <div className="flex justify-end md:justify-start"></div>
          </div>
          <div className="divide-y divide-gray-100">
            {currentUsers.length > 0 ? (
              currentUsers.map((userData) => (
                <UserItem key={userData._id} userData={userData} />
              ))
            ) : (
              <div className="px-6 py-4 text-center text-sm text-gray-500">
                No users found matching your search.
              </div>
            )}
          </div>
        </div>
        {/* Only show pagination if there are users AFTER filtering */}
        {sortedUsers.length > itemsPerPage && (
          <div className="flex justify-center items-center mt-6 space-x-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-gray-700 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default UserManagement;
