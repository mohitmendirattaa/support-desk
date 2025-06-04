// UserManagement.jsx
import React, { useEffect, useState } from "react";
import { Users, ChevronLeft, ChevronRight } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { fetchAllUsers, resetUserManagement } from "../features/users/userSlice"; // Corrected import path
import { toast } from "react-toastify";
import UserItem from "../components/UserItem"; // Corrected import path

function UserManagement() {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);

  const { allUsers, isLoadingUsers, isErrorUsers, messageUsers } = useSelector(
    (state) => state.users
  );

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

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

  const sortedUsers = [...allUsers].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (isLoadingUsers) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-700">Loading users...</p>
      </div>
    );
  }

  if (isErrorUsers) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-red-600">Error: {messageUsers}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 font-sans flex items-center justify-center mt-20">
      <div className="max-w-7xl w-full mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mb-10">
        <div className="bg-gradient-to-r from-green-600 to-teal-700 p-8 text-white text-center rounded-t-2xl flex items-center justify-center">
          <Users size={48} className="mr-4 opacity-90" />
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
            User Management
          </h1>
        </div>
        <div className="p-6 sm:p-8">
          <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 p-4 lg:p-6 border-b border-gray-200 bg-gray-100 font-semibold text-gray-500 text-sm uppercase">
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
                  No users found or you do not have permission to view them.
                </div>
              )}
            </div>
          </div>
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
      </div>
    </div>
  );
}

export default UserManagement;
