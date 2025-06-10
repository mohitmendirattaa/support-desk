import React, { useEffect, useState } from "react";
import { FaUser, FaCheckCircle, FaSpinner } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { register, reset } from "../features/auth/authSlice"; // Ensure 'reset' is imported
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import { Country, State, City } from "country-state-city";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password2: "", // For client-side password confirmation
    phoneNumber: "",
    employeeCode: "",
    company: "",
    selectedCountryCode: "",
    selectedStateCode: "",
    selectedCityName: "",
  });

  const [actualPhoneCode, setActualPhoneCode] = useState("91"); // Default to India's phone code

  const [allCountries, setAllCountries] = useState([]);
  const [statesOfSelectedCountry, setStatesOfSelectedCountry] = useState([]);
  const [citiesOfSelectedState, setCitiesOfSelectedState] = useState([]);

  const {
    name,
    email,
    password,
    password2,
    phoneNumber,
    employeeCode,
    company,
    selectedCountryCode,
    selectedStateCode,
    selectedCityName,
  } = formData;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    // We still access these from Redux state for feedback (loading, error, success).
    // `user` is the *currently logged-in user* (expected to be an admin on this page).
    user: loggedInUser, // Keeping this to check if an admin is logged in (though implicit for this page)
    isError,
    isLoading,
    isSuccess,
    message,
  } = useSelector((state) => state.auth);

  // Effect to handle the outcome of the registration attempt
  useEffect(() => {
    if (isError) {
      // Display error message from Redux state or a generic one
      toast.error(message || "Registration failed. Please try again.");
      // Dispatch reset to clear `isError`, `isSuccess`, `message` flags
      // but NOT to log out the admin (this is handled by authSlice.js).
      dispatch(reset());
    }

    if (isSuccess) {
      // Since this page is exclusively for admin-driven user creation,
      // a `isSuccess` here means a new user was successfully added by the admin.
      toast.success("New user registered successfully!");

      // Navigate the admin back to the user management page after successful creation.
      // Make sure this path (`/admin-dashboard/users`) is correct for your application.
      navigate("/admin-dashboard/users");

      // Reset the form fields to clear inputs for the next potential user registration.
      setFormData({
        name: "",
        email: "",
        password: "",
        password2: "",
        phoneNumber: "",
        employeeCode: "",
        company: "",
        selectedCountryCode: "",
        selectedStateCode: "",
        selectedCityName: "",
      });

      // Important: Do NOT dispatch `reset()` here on success.
      // `reset()` would clear success flags but *more critically* if its implementation
      // ever changed to clear `state.user`, it would log out the admin.
      // The `authSlice` is now configured to NOT log out the admin on `register.fulfilled`,
      // so we just need to clear the form and navigate.
    }
    // Dependencies: This effect runs when these values change.
    // `loggedInUser` is not a direct dependency for the *action* taken here,
    // as the page's purpose is already defined as admin-only new user creation.
  }, [isSuccess, isError, message, navigate, dispatch]);

  // Effects for country, state, city dropdowns population and resets
  useEffect(() => {
    setAllCountries(Country.getAllCountries());
  }, []);

  useEffect(() => {
    if (selectedCountryCode) {
      setStatesOfSelectedCountry(State.getStatesOfCountry(selectedCountryCode));
      setFormData((prev) => ({
        ...prev,
        selectedStateCode: "", // Clear state and city when country changes
        selectedCityName: "",
      }));
    } else {
      setStatesOfSelectedCountry([]);
      setCitiesOfSelectedState([]);
      setFormData((prev) => ({
        ...prev,
        selectedStateCode: "",
        selectedCityName: "",
      }));
    }
  }, [selectedCountryCode]);

  useEffect(() => {
    if (selectedCountryCode && selectedStateCode) {
      setCitiesOfSelectedState(
        City.getCitiesOfState(selectedCountryCode, selectedStateCode)
      );
      setFormData((prev) => ({ ...prev, selectedCityName: "" })); // Clear city when state changes
    } else {
      setCitiesOfSelectedState([]);
      setFormData((prev) => ({ ...prev, selectedCityName: "" }));
    }
  }, [selectedCountryCode, selectedStateCode]);

  // Form submission handler
  const onSubmit = async (e) => {
    e.preventDefault();

    if (password !== password2) {
      toast.error("Passwords do not match");
      return;
    }

    // Get display names for location string based on selected codes
    const countryName =
      Country.getCountryByCode(selectedCountryCode)?.name || "";
    const stateName =
      State.getStateByCodeAndCountry(selectedStateCode, selectedCountryCode)
        ?.name || "";
    const cityName = selectedCityName;

    // Construct the combined location string
    let location = "";
    if (cityName) {
      location = `${cityName}, ${
        stateName ? stateName + ", " : ""
      }${countryName}`;
    } else if (stateName) {
      location = `${stateName}, ${countryName}`;
    } else if (countryName) {
      location = countryName;
    }

    // Validate all required fields are filled
    if (
      !name ||
      !email ||
      !password ||
      !phoneNumber ||
      !employeeCode ||
      !location ||
      !company
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    // Format phone number with country code
    const contact = `+${actualPhoneCode} ${phoneNumber}`;

    // Prepare user data object for registration
    const userData = {
      name,
      email,
      password,
      contact,
      employeeCode,
      location,
      company,
    };

    try {
      // Dispatch the register async thunk.
      // The .unwrap() method allows us to chain .then/.catch,
      // but in this case, we rely on the `useEffect` listening to `isSuccess` and `isError`.
      await dispatch(register(userData)).unwrap();
    } catch (error) {
      // `useEffect` with `isError` will handle the toast notification for errors.
      // No specific error handling needed here as it's covered by Redux state.
    }
  };

  // Generic handler for text input changes
  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Specific handlers for select dropdown changes
  const handleCountryChange = (e) => {
    const code = e.target.value;
    setFormData((prevState) => ({
      ...prevState,
      selectedCountryCode: code,
      selectedStateCode: "", // Reset dependent fields
      selectedCityName: "",
    }));
  };

  const handleStateChange = (e) => {
    const code = e.target.value;
    setFormData((prevState) => ({
      ...prevState,
      selectedStateCode: code,
      selectedCityName: "", // Reset dependent fields
    }));
  };

  const handleCityChange = (e) => {
    const name = e.target.value;
    setFormData((prevState) => ({
      ...prevState,
      selectedCityName: name,
    }));
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-indigo-50 to-purple-50 pt-32 px-4 sm:px-6 lg:px-8 font-sans pb-8">
      <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-2xl max-w-4xl w-full border border-gray-100 transform transition-all duration-300 hover:shadow-xl">
        <section className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-3 leading-tight flex items-center justify-center">
            <FaUser className="mr-4 text-indigo-700 text-3xl sm:text-4xl" />
            <span className="text-indigo-800">Register New User</span>{" "}
            {/* Changed title */}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-lg mx-auto">
            Admin: Create new user accounts for the Welspun Support Desk.
          </p>
        </section>

        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
            {/* Full Name Input */}
            <div>
              <label
                htmlFor="name"
                className="block text-gray-700 text-sm font-semibold mb-2 text-left"
              >
                Full Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 text-base placeholder-gray-400"
                id="name"
                name="name"
                placeholder="Enter Full Name"
                value={name}
                onChange={onChange}
                required
              />
            </div>

            {/* Employee Code Input */}
            <div>
              <label
                htmlFor="employeeCode"
                className="block text-gray-700 text-sm font-semibold mb-2 text-left"
              >
                Employee Code
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 text-base placeholder-gray-400"
                id="employeeCode"
                name="employeeCode"
                placeholder="e.g., WCL12345"
                value={employeeCode}
                onChange={onChange}
                required
              />
            </div>

            {/* Email Address Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-gray-700 text-sm font-semibold mb-2 text-left"
              >
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 text-base placeholder-gray-400"
                id="email"
                name="email"
                placeholder="Enter Email"
                value={email}
                onChange={onChange}
                required
              />
            </div>

            {/* Phone Number Input with Country Code Selector */}
            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-gray-700 text-sm font-semibold mb-2 text-left"
              >
                Phone Number
              </label>
              <div className="flex items-center gap-2">
                <select
                  className="w-1/4 px-2 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 text-base"
                  value={actualPhoneCode}
                  onChange={(e) => setActualPhoneCode(e.target.value)}
                >
                  {allCountries
                    .filter((c) => c.phonecode) // Ensure only countries with a phone code are shown
                    .map((country) => (
                      <option key={country.isoCode} value={country.phonecode}>
                        +{country.phonecode} ({country.isoCode})
                      </option>
                    ))}
                </select>
                <input
                  type="tel" // Use type="tel" for phone numbers
                  className="flex-grow px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 text-base placeholder-gray-400"
                  id="phoneNumber"
                  name="phoneNumber"
                  placeholder="e.g., 9876543210"
                  value={phoneNumber}
                  onChange={onChange}
                  required
                />
              </div>
            </div>

            {/* Company Name Input */}
            <div>
              <label
                htmlFor="company"
                className="block text-gray-700 text-sm font-semibold mb-2 text-left"
              >
                Company Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 text-base placeholder-gray-400"
                id="company"
                name="company"
                placeholder="Company Name"
                value={company}
                onChange={onChange}
                required
              />
            </div>

            {/* Country Selector */}
            <div>
              <label
                htmlFor="country"
                className="block text-gray-700 text-sm font-semibold mb-2 text-left"
              >
                Country
              </label>
              <select
                id="country"
                name="selectedCountryCode"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 text-base"
                value={selectedCountryCode}
                onChange={handleCountryChange}
              >
                <option value="">Select country</option>
                {allCountries.map((c) => (
                  <option key={c.isoCode} value={c.isoCode}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* State/Region Selector */}
            <div>
              <label
                htmlFor="state"
                className="block text-gray-700 text-sm font-semibold mb-2 text-left"
              >
                State/Region
              </label>
              <select
                id="state"
                name="selectedStateCode"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 text-base"
                value={selectedStateCode}
                onChange={handleStateChange}
                disabled={
                  !selectedCountryCode || statesOfSelectedCountry.length === 0
                }
              >
                <option value="">
                  {selectedCountryCode
                    ? statesOfSelectedCountry.length > 0
                      ? "Select state/region"
                      : "No states/regions available"
                    : "Select a country first"}
                </option>
                {statesOfSelectedCountry.map((s) => (
                  <option key={s.isoCode} value={s.isoCode}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* City Selector */}
            <div>
              <label
                htmlFor="city"
                className="block text-gray-700 text-sm font-semibold mb-2 text-left"
              >
                City
              </label>
              <select
                id="city"
                name="selectedCityName"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 text-base"
                value={selectedCityName}
                onChange={handleCityChange}
                disabled={
                  !selectedStateCode || citiesOfSelectedState.length === 0
                }
              >
                <option value="">
                  {selectedStateCode
                    ? citiesOfSelectedState.length > 0
                      ? "Select city"
                      : "No cities available"
                    : "Select a state/region first"}
                </option>
                {citiesOfSelectedState.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-gray-700 text-sm font-semibold mb-2 text-left"
              >
                Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 text-base placeholder-gray-400"
                id="password"
                name="password"
                placeholder="Enter password"
                value={password}
                onChange={onChange}
                required
              />
            </div>

            {/* Confirm Password Input */}
            <div>
              <label
                htmlFor="password2"
                className="block text-gray-700 text-sm font-semibold mb-2 text-left"
              >
                Confirm Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 text-base placeholder-gray-400"
                id="password2"
                name="password2"
                placeholder="Confirm password"
                value={password2}
                onChange={onChange}
                required
              />
            </div>
          </div>
          <div className="mt-6">
            <button
              type="submit"
              className="w-full flex items-center justify-center px-6 py-4
                                 bg-gradient-to-r from-indigo-600 to-purple-700 text-white
                                 font-semibold text-lg rounded-xl shadow-lg
                                 hover:from-indigo-700 hover:to-purple-800
                                 transform hover:-translate-y-1 transition duration-300 ease-in-out
                                 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50"
              disabled={isLoading} // Disable button while loading/submitting
            >
              {isLoading ? (
                <FaSpinner className="animate-spin mr-3 text-xl" />
              ) : (
                <FaCheckCircle className="mr-3 text-xl" />
              )}
              {isLoading ? "Registering User..." : "Register User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
