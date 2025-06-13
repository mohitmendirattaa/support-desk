// components/UserItem.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { updateUserStatus } from "../features/users/userSlice";
import { toast } from "react-toastify";

function UserItem({ userData }) {
  const dispatch = useDispatch();

  const getStatusClasses = (status) => {
    switch (status) {
      case "active":
        return "bg-green-700 text-white font-semibold ring-1 ring-inset ring-green-800";
      case "inactive":
        return "bg-red-700 text-white font-semibold ring-1 ring-inset ring-red-800";
      default:
        return "bg-gray-700 text-white font-semibold ring-1 ring-inset ring-gray-800";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      console.error("UserItem: Error formatting date:", e);
      return "Invalid Date";
    }
  };

  const handleStatusToggle = () => {
    const newStatus = userData.status === "active" ? "inactive" : "active";

    if (userData.id) {
      dispatch(updateUserStatus({ id: userData.id, status: newStatus }));
    } else {
      console.error(
        "UserItem: Cannot update status - userData.id is missing or invalid for userData:",
        userData
      );
      toast.error("Unable to update user status: User ID not found.");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-4 px-4 py-2 lg:px-6 lg:py-2 hover:bg-gray-50 transition-colors cursor-pointer items-center border-b border-gray-100 last:border-b-0">
      <div className="text-gray-900 font-medium md:col-span-1">
        <Link
          onClick={() =>
            console.log(
              "UserItem: Navigating to user details for ID:",
              userData.id
            )
          }
          to={`/admin-dashboard/users/${userData.id}`}
          className="text-blue-600 hover:text-blue-800 hover:underline"
        >
          {userData.name}
        </Link>
      </div>

      <div className="hidden md:block text-gray-700 text-sm">
        {userData.employeeCode}
      </div>

      <div className="hidden md:block text-gray-700 text-sm">
        {userData.company}
      </div>

      <div className="hidden md:block text-gray-700 text-sm">
        {userData.role}
      </div>

      <div className="hidden md:block text-gray-700 text-sm">
        {formatDate(userData.createdAt)}
      </div>

      <div className="flex justify-start items-center md:col-span-1">
        <span
          onClick={handleStatusToggle}
          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full uppercase cursor-pointer ${getStatusClasses(
            userData.status
          )}`}
        >
          {userData.status}
        </span>
      </div>

      <div className="flex justify-end md:justify-start md:col-span-1">
        <Link
          onClick={() =>
            console.log(
              "UserItem: Navigating to user details from button for ID:",
              userData.id
            )
          }
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors text-sm font-semibold whitespace-nowrap"
          to={`/admin-dashboard/users/${userData.id}`}
        >
          View Details
        </Link>
      </div>

      <div className="md:hidden col-span-full border-t border-gray-100 pt-4 mt-4">
        <h3 className="text-lg font-bold text-blue-800 mb-2">User Summary</h3>
        <p className="text-gray-700 mb-1">
          <strong className="font-semibold">Employee Code:</strong>{" "}
          {userData.employeeCode}
        </p>
        <p className="text-gray-700 mb-1">
          <strong className="font-semibold">Company:</strong> {userData.company}
        </p>
        <p className="text-gray-700 mb-1">
          <strong className="font-semibold">Role:</strong> {userData.role}
        </p>
        <p className="text-gray-700 mb-1">
          <strong className="font-semibold">Registered On:</strong>{" "}
          {formatDate(userData.createdAt)}
        </p>
        <p className="text-gray-700 mb-1">
          <strong className="font-semibold">Status:</strong>{" "}
          <span
            onClick={handleStatusToggle}
            className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase cursor-pointer ${getStatusClasses(
              userData.status
            )}`}
          >
            {userData.status}
          </span>
        </p>
      </div>
    </div>
  );
}

export default UserItem;
