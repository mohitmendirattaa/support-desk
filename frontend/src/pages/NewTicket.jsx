import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { createTicket } from "../features/tickets/ticketSlice";
import BackButton from "../components/BackButton";
import { FaUser } from "react-icons/fa";

// Define your SAP Modules and Digital Platforms
const sapModules = ["MM", "SD", "FI", "PP", "PM", "PS", "QM", "Other"];
const digitalPlatforms = ["Platform 1", "Platform 2", "Platform 3"];

function NewTicket() {
  const { user } = useSelector((state) => state.auth);
  const { name, email, employeeCode, location, company, contact } = user;

  const [service, setService] = useState("Incident");
  const [category, setCategory] = useState("Digital");
  const [subCategory, setSubCategory] = useState("");
  const [subCategories, setSubCategories] = useState(digitalPlatforms);
  const [priority, setPriority] = useState("Low");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get today's date in YYYY-MM-DD format for the min attribute of the date input
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const start = new Date(startDate);
    let daysToAdd = 0;
    switch (priority) {
      case "High":
        daysToAdd = 1;
        break;
      case "Medium":
        daysToAdd = 3;
        break;
      case "Low":
        daysToAdd = 7;
        break;
      default:
        daysToAdd = 7;
    }
    const futureDate = new Date(start);
    futureDate.setDate(start.getDate() + daysToAdd);
    setEndDate(futureDate.toISOString().split("T")[0]);
  }, [priority, startDate]);

  // Effect to update subcategories based on selected category
  useEffect(() => {
    if (category === "SAP") {
      setSubCategories(sapModules);
      setSubCategory(sapModules[0] || "");
    } else if (category === "Digital") {
      setSubCategories(digitalPlatforms);
      setSubCategory(digitalPlatforms[0] || "");
    } else {
      setSubCategories([]);
      setSubCategory("");
    }
  }, [category]);

  const onSubmit = (e) => {
    e.preventDefault();

    if (
      !subCategory ||
      !description ||
      !priority ||
      !startDate ||
      !endDate ||
      !service ||
      !category
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    dispatch(
      createTicket({
        subCategory,
        description,
        priority,
        startDate,
        endDate,
        service,
        category,
      })
    )
      .unwrap()
      .then(() => {
        toast.success("New ticket created successfully!");
        navigate("/tickets");
      })
      .catch((error) => {
        toast.error(error.message || "Failed to create ticket.");
      });
  };

  return (
    <>
      <BackButton />
      {/* Main Container - Centered and Spaced */}
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 mt-8 mb-8">
        <div className="flex flex-col lg:flex-row gap-8 bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
          {/* Left Section: Ticket Form */}
          <div className="flex-1 p-6 lg:p-10">
            {/* Header for Ticket Information */}
            <div className="bg-blue-600 text-white font-bold text-lg py-3 px-6 rounded-t-lg -mx-6 lg:-mx-10 -mt-6 lg:-mt-10 mb-6 text-center shadow-md">
              CREATE NEW TICKET
            </div>

            <form
              onSubmit={onSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"
            >
              {/* Service Type */}
              <div>
                <label
                  htmlFor="service"
                  className="block text-gray-700 text-sm font-semibold mb-2"
                >
                  Service Type
                </label>
                <select
                  name="service"
                  id="service"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 text-base"
                >
                  <option value="Incident">Incident</option>
                  <option value="Service">Service Request</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="category"
                  className="block text-gray-700 text-sm font-semibold mb-2"
                >
                  Category
                </label>
                <select
                  name="category"
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 text-base"
                >
                  <option value="Digital">Digital Platform</option>
                  <option value="SAP">SAP Module</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label
                  htmlFor="priority"
                  className="block text-gray-700 text-sm font-semibold mb-2"
                >
                  Priority
                </label>
                <select
                  name="priority"
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 text-base"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              {/* Sub-Category (Dynamic Label) */}
              <div>
                <label
                  htmlFor="subCategory"
                  className="block text-gray-700 text-sm font-semibold mb-2"
                >
                  {category === "SAP" ? "SAP Module" : "Digital Platform"}
                </label>
                <select
                  name="subCategory"
                  id="subCategory"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  disabled={!category || subCategories.length === 0}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  {subCategories.length > 0 ? (
                    subCategories.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))
                  ) : (
                    <option value="">Select a Category First</option>
                  )}
                </select>
              </div>

              {/* Date Inputs */}
              <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="startDate"
                    className="block text-gray-700 text-sm font-semibold mb-2"
                  >
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={today}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 text-base"
                  />
                </div>
                <div>
                  <label
                    htmlFor="endDate"
                    className="block text-gray-700 text-sm font-semibold mb-2"
                  >
                    Resolution Target Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    id="endDate"
                    value={endDate}
                    readOnly
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed focus:outline-none"
                  />
                </div>
              </div>

              {/* Description Header */}
              <div className="col-span-1 md:col-span-2">
                <div className="bg-blue-600 text-white font-bold text-lg py-3 px-6 rounded-lg mb-6 text-center shadow-md">
                  TICKET DESCRIPTION
                </div>
              </div>

              {/* Description Textarea */}
              <div className="col-span-1 md:col-span-2">
                <label htmlFor="description" className="sr-only">
                  Description
                </label>
                {/* Screen reader only label */}
                <textarea
                  name="description"
                  id="description"
                  placeholder="Provide a detailed description of your issue or request..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="6" // Give more vertical space
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 text-base resize-y min-h-[120px]"
                />
              </div>

              <div className="col-span-1 md:col-span-2 mt-4">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center px-6 py-4
                             bg-gradient-to-r from-blue-600 to-indigo-700 text-white
                             font-semibold text-lg rounded-xl shadow-lg
                             hover:from-blue-700 hover:to-indigo-800
                             transform hover:-translate-y-1 transition duration-300 ease-in-out
                             focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>

          {/* Right Section: User Information Container */}
          <div className="lg:w-1/3 p-6 lg:p-10 flex flex-col items-center rounded-b-xl lg:rounded-l-none lg:rounded-r-xl">
            {/* Header for User Information */}
            <div className="bg-blue-600 text-white font-bold text-lg py-3 px-6 rounded-t-lg -mx-6 lg:-mx-10 -mt-6 lg:-mt-10 mb-6 w-full text-center shadow-md">
              YOUR INFORMATION
            </div>
            {/* User Information Card */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100 w-full max-w-md flex flex-col items-center">
              <div className="p-8 bg-blue-50 rounded-full shadow-lg border border-blue-200 mb-6">
                <FaUser className="text-blue-700 text-5xl" />
              </div>
              <div className="text-gray-800 text-left space-y-3">
                <p className="text-lg">
                  <strong>NAME:</strong> {name}
                </p>
                <p className="text-lg">
                  <strong>EMP CODE:</strong> {employeeCode}
                </p>
                <p className="text-lg">
                  <strong>CONTACT:</strong> {contact}
                </p>
                <p className="text-lg">
                  <strong>EMAIL:</strong> {email}
                </p>
                <p className="text-lg">
                  <strong>LOCATION:</strong> {location}
                </p>
                <p className="text-lg">
                  <strong>COMPANY:</strong> {company}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default NewTicket;
