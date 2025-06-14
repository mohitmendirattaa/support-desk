import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { createTicket } from "../features/tickets/ticketSlice";
import BackButton from "../components/BackButton";
import { FaUser } from "react-icons/fa";

// Import Lottie components and your animation data
import Lottie from "react-lottie";
import loadingAnimation from "../images/ticket.json"; // <--- ADJUST THIS PATH TO YOUR .lottie FILE

// Define your SAP Modules and Digital Platforms
const sapModules = ["MM", "SD", "FI", "PP", "PM", "PS", "QM", "Other"];
const digitalPlatforms = ["Platform 1", "Platform 2", "Platform 3"];

function NewTicket() {
  const { user } = useSelector((state) => state.auth);
  // Assuming ticketSlice also exposes an isLoading state
  const { isLoading: isTicketLoading } = useSelector((state) => state.tickets); // <--- Get loading state from tickets slice

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
  const [selectedFile, setSelectedFile] = useState(null); // New state for the selected file

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get today's date inYYYY-MM-DD format for the min attribute of the date input
  const today = new Date().toISOString().split("T")[0];

  // Lottie animation default options
  const defaultLottieOptions = {
    loop: true,
    autoplay: true,
    animationData: loadingAnimation,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

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

  // Handler for file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Basic validation for file types (you can enhance this)
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "application/pdf",
        "application/msword", // .doc
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
      ];
      if (allowedTypes.includes(file.type)) {
        setSelectedFile(file);
      } else {
        toast.error(
          "Unsupported file type. Please upload an image, PDF, or Word document."
        );
        setSelectedFile(null); // Clear the selection if invalid
        e.target.value = null; // Clear the input field
      }
    } else {
      setSelectedFile(null);
    }
  };

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

    // Create a FormData object to send both text and file data
    const ticketData = new FormData();
    ticketData.append("subCategory", subCategory);
    ticketData.append("description", description);
    ticketData.append("priority", priority);
    ticketData.append("startDate", startDate);
    ticketData.append("endDate", endDate);
    ticketData.append("service", service);
    ticketData.append("category", category);

    if (selectedFile) {
      ticketData.append("file", selectedFile); // Append the selected file
      // NEW: Append MIME type and file name for backend storage
      ticketData.append("attachmentMimeType", selectedFile.type);
      ticketData.append("attachmentFileName", selectedFile.name);
    }

    dispatch(createTicket(ticketData)) // Pass the FormData object
      .unwrap()
      .then(() => {
        toast.success("New ticket created successfully!");
        navigate("/tickets");
      })
      .catch((error) => {
        toast.error(error.message || "Failed to create ticket.");
      });
  };

  // ----------------------------------------------------
  // IMPORTANT: Display Lottie Spinner when ticket is loading
  if (isTicketLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen" // Centers the spinner vertically and horizontally
        style={{ backgroundColor: "rgba(255, 255, 255, 0.8)", zIndex: 1000 }} // Optional: a slight overlay
      >
        <div className="text-center">
          <Lottie
            options={defaultLottieOptions}
            height={200} // Adjust size as needed
            width={200} // Adjust size as needed
          />
          <p className="mt-4 text-xl font-semibold text-blue-700">
            Submitting your ticket...
          </p>
        </div>
      </div>
    );
  }
  // ----------------------------------------------------

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 mb-8">
      <header className="flex justify-between items-center mb-8">
        <BackButton />
        <h1 className="text-4xl font-extrabold text-blue-800 tracking-tight text-center flex-grow">
          Create New Ticket
        </h1>
        <div className="w-auto opacity-0">
          <BackButton />
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
        <div className="flex-1 p-6 lg:p-10">
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
                <option value="Service Request">Service Request</option>
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
              <div className="bg-blue-600 text-white font-bold text-lg py-3 px-6 rounded-lg mb-1 text-center shadow-md">
                TICKET DESCRIPTION
              </div>
            </div>

            {/* Description Textarea */}
            <div className="col-span-1 md:col-span-2">
              <label htmlFor="description" className="sr-only">
                Description
              </label>
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

            <div className="col-span-1 md:col-span-2">
              <div className="bg-blue-600 text-white font-bold text-lg py-3 px-6 rounded-lg mb-1 text-center shadow-md">
                UPLOAD FILE
              </div>
            </div>

            {/* File Picker Box */}
            <div className="col-span-1 md:col-span-2 mt-2">
              <label
                htmlFor="file-upload"
                className="block text-gray-700 text-sm font-semibold mb-2"
              >
                Attach Files (Images, PDFs, Word Documents)
              </label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition duration-300 ease-in-out"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-8 h-8 mb-4 text-gray-500"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 16"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L7 9m3-3 3 3"
                      />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      JPG, PNG, GIF, PDF, DOC, DOCX (MAX. 5MB)
                    </p>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    // Restrict accepted file types directly in the input
                    accept=".jpeg,.jpg,.png,.gif,.pdf,.doc,.docx"
                  />
                </label>
              </div>
              {selectedFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected file:{" "}
                  <span className="font-medium">{selectedFile.name}</span>
                </p>
              )}
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
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-xl border border-blue-300 w-full max-w-md flex flex-col items-center">
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
  );
}

export default NewTicket;
