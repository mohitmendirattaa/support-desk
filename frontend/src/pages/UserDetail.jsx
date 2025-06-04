import React, { useEffect, useState } from "react"; // Import useState
import { useParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchSingleUser,
  resetUserManagement,
  updateUser, 
} from "../features/users/userSlice";
import { toast } from "react-toastify";
import {
  User,
  Building,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Code,
  ArrowLeft,
  Fingerprint,
  Edit, 
  Save, 
  XCircle, 
} from "lucide-react";

function UserDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { user: loggedInUser } = useSelector((state) => state.auth);
  const { singleUser, isLoadingUsers, isErrorUsers, messageUsers } =
    useSelector((state) => state.users);

  const [isEditing, setIsEditing] = useState(false); // State to manage edit mode
  const [editableUser, setEditableUser] = useState({}); // State to hold editable user data

   useEffect(() => {
    /* if (isErrorUsers) {
      toast.error(messageUsers);
    } 
 */
    if (id && loggedInUser && loggedInUser.token) {
      dispatch(fetchSingleUser(id));
    } else if (!loggedInUser || !loggedInUser.token) {
      toast.error("Authentication token not found. Please log in.");
    }

    return () => {
      dispatch(resetUserManagement());
    };
  }, [dispatch, id, loggedInUser, isErrorUsers, messageUsers]);

  // When singleUser changes, update editableUser
  useEffect(() => {
    if (singleUser) {
      setEditableUser({ ...singleUser });
    }
  }, [singleUser]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setEditableUser({ ...singleUser }); // Revert changes if cancelled
  };

  const handleSaveClick = () => {
    // Dispatch the update action with editableUser data
    if (loggedInUser && loggedInUser.token && id) {
      dispatch(updateUser({ userId: id, userData: editableUser }));
      setIsEditing(false);
    } else {
      toast.error("Authentication token not found or user ID missing.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditableUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (isLoadingUsers) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-700">Loading user profile...</p>
      </div>
    );
  }

  if (isErrorUsers) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <p className="text-lg text-red-600">
          Error loading user profile: {messageUsers}
        </p>
      </div>
    );
  }

  if (!singleUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <p className="text-lg text-gray-700">User not found.</p>
      </div>
    );
  }

  // Destructure from singleUser for display when not editing
  const {
    _id,
    name,
    email,
    employeeCode,
    location,
    company,
    contact,
    role,
    createdAt,
  } = singleUser;

  const {
    name: editableName,
    email: editableEmail,
    employeeCode: editableEmployeeCode,
    location: editableLocation,
    company: editableCompany,
    contact: editableContact,
    role: editableRole,
  } = editableUser;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8 font-sans flex items-center justify-center mt-10">
      <div className="max-w-2xl w-full mx-auto bg-white mb-20 rounded-3xl shadow-2xl mt-20 mb-5 overflow-hidden border border-gray-100 transform hover:scale-105 transition-transform duration-300 ease-in-out">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-6 text-white text-center rounded-t-3xl relative">
          <Link
            to="/admin-dashboard/users"
            className="absolute top-4 left-4 text-white hover:text-blue-300 transition duration-200 p-2 rounded-full hover:bg-white/10"
            aria-label="Back to User Management"
          >
            <ArrowLeft size={26} />
          </Link>
          <div className="flex flex-col items-center justify-center pt-2">
            <div className="bg-white p-3 rounded-full shadow-lg mb-3 border-3 border-blue-300">
              <User size={60} className="text-blue-700" />
            </div>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={editableName || ""}
                onChange={handleChange}
                className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-wide drop-shadow-md text-white bg-transparent border-b-2 border-white focus:outline-none focus:border-blue-300 text-center"
              />
            ) : (
              <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-wide drop-shadow-md">
                {name}
              </h1>
            )}

            {isEditing ? (
              <input
                type="text"
                name="role"
                value={editableRole || ""}
                onChange={handleChange}
                className="text-blue-200 text-lg mt-1 font-semibold bg-transparent border-b-2 border-blue-200 focus:outline-none focus:border-blue-300 text-center"
              />
            ) : (
              <p className="text-blue-200 text-lg mt-1 font-semibold">
                {role ? role.charAt(0).toUpperCase() + role.slice(1) : "N/A"}{" "}
              </p>
            )}
          </div>
          <div className="absolute top-4 right-4">
            {isEditing ? (
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveClick}
                  className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition duration-200"
                  aria-label="Save changes"
                >
                  <Save size={24} />
                </button>
                <button
                  onClick={handleCancelClick}
                  className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition duration-200"
                  aria-label="Cancel editing"
                >
                  <XCircle size={24} />
                </button>
              </div>
            ) : (
              <button
                onClick={handleEditClick}
                className="p-2 rounded-full text-white hover:text-blue-300 transition duration-200 hover:bg-white/10"
                aria-label="Edit user profile"
              >
                <Edit size={26} />
              </button>
            )}
          </div>
        </div>

        <div className="p-5 sm:p-7 lg:p-8 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center p-4 bg-white rounded-xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-200 ease-in-out transform hover:-translate-y-1">
              <Code size={24} className="text-indigo-600 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Employee Code
                </p>
                {isEditing ? (
                  <input
                    type="text"
                    name="employeeCode"
                    value={editableEmployeeCode || ""}
                    onChange={handleChange}
                    className="text-lg font-semibold text-gray-900 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                  />
                ) : (
                  <p className="text-lg font-semibold text-gray-900">
                    {employeeCode || "N/A"}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center p-4 bg-white rounded-xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-200 ease-in-out transform hover:-translate-y-1">
              <Building
                size={24}
                className="text-green-600 mr-3 flex-shrink-0"
              />
              <div>
                <p className="text-sm text-gray-500 font-medium">Company</p>
                {isEditing ? (
                  <input
                    type="text"
                    name="company"
                    value={editableCompany || ""}
                    onChange={handleChange}
                    className="text-lg font-semibold text-gray-900 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                  />
                ) : (
                  <p className="text-lg font-semibold text-gray-900">
                    {company || "N/A"}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center p-4 bg-white rounded-xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-200 ease-in-out transform hover:-translate-y-1">
              <Phone size={24} className="text-purple-600 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500 font-medium">Contact</p>
                {isEditing ? (
                  <input
                    type="text"
                    name="contact"
                    value={editableContact || ""}
                    onChange={handleChange}
                    className="text-lg font-semibold text-gray-900 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                  />
                ) : (
                  <p className="text-lg font-semibold text-gray-900">
                    {contact || "N/A"}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center p-4 bg-white rounded-xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-200 ease-in-out transform hover:-translate-y-1">
              <Mail size={24} className="text-red-600 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500 font-medium">Email</p>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={editableEmail || ""}
                    onChange={handleChange}
                    className="text-lg font-semibold text-gray-900 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                  />
                ) : (
                  <p className="text-lg font-semibold text-gray-900">
                    {email || "N/A"}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center p-4 bg-white rounded-xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-200 ease-in-out transform hover:-translate-y-1">
              <MapPin
                size={24}
                className="text-orange-600 mr-3 flex-shrink-0"
              />
              <div>
                <p className="text-sm text-gray-500 font-medium">Location</p>
                {isEditing ? (
                  <input
                    type="text"
                    name="location"
                    value={editableLocation || ""}
                    onChange={handleChange}
                    className="text-lg font-semibold text-gray-900 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                  />
                ) : (
                  <p className="text-lg font-semibold text-gray-900">
                    {location || "N/A"}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center p-4 bg-white rounded-xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-200 ease-in-out transform hover:-translate-y-1">
              <Calendar
                size={24}
                className="text-teal-600 mr-3 flex-shrink-0"
              />
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Registered On
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatDate(createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center p-4 bg-white rounded-xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-200 ease-in-out transform hover:-translate-y-1 md:col-span-2">
              <Fingerprint
                size={24}
                className="text-gray-600 mr-3 flex-shrink-0"
              />
              <div>
                <p className="text-sm text-gray-500 font-medium">User ID</p>
                <p className="text-base font-semibold text-gray-900 break-all">
                  {_id || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDetail;
