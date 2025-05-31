import React, { useEffect, useState } from "react";
import { FaUser, FaCheckCircle, FaSpinner } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { register, reset } from "../features/auth/authSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import { Country, State, City } from "country-state-city";

function Register() {
  const [formData, setFormData] = useState({
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

  const [actualPhoneCode, setActualPhoneCode] = useState("91");

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

  const { user, isError, isLoading, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      toast.error(message || "Registration failed. Please try again.");
      dispatch(reset()); // Reset on error too
    }

    if (isSuccess) {
      // Only check for isSuccess specifically here
      toast.success("Registration successful!");
      navigate("/");
      dispatch(reset()); 
    }
  }, [user, isError, isSuccess, message, navigate, dispatch]); 

  useEffect(() => {
    setAllCountries(Country.getAllCountries());
  }, []);

  useEffect(() => {
    if (selectedCountryCode) {
      setStatesOfSelectedCountry(State.getStatesOfCountry(selectedCountryCode));
      setFormData((prev) => ({
        ...prev,
        selectedStateCode: "",
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
      setFormData((prev) => ({ ...prev, selectedCityName: "" }));
    } else {
      setCitiesOfSelectedState([]);
      setFormData((prev) => ({ ...prev, selectedCityName: "" }));
    }
  }, [selectedCountryCode, selectedStateCode]);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (password !== password2) {
      toast.error("Passwords do not match");
      return;
    }

    const countryName =
      Country.getCountryByCode(selectedCountryCode)?.name || "";
    const stateName =
      State.getStateByCodeAndCountry(selectedStateCode, selectedCountryCode)
        ?.name || "";
    const cityName = selectedCityName;

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

    const contact = `+${actualPhoneCode} ${phoneNumber}`;

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
      await dispatch(register(userData)).unwrap();
    } catch (error) {
      // Errors are handled by the useEffect watching `isError`
    }
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleCountryChange = (e) => {
    const code = e.target.value;
    setFormData((prevState) => ({
      ...prevState,
      selectedCountryCode: code,
      selectedStateCode: "",
      selectedCityName: "",
    }));
  };

  const handleStateChange = (e) => {
    const code = e.target.value;
    setFormData((prevState) => ({
      ...prevState,
      selectedStateCode: code,
      selectedCityName: "",
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
            <span className="text-indigo-800">Register Account</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-lg mx-auto">
            Join the Welspun Support Desk. Please fill in your details below.
          </p>
        </section>

        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
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
                  {/* Filter to only show countries with a phonecode */}
                  {allCountries
                    .filter((c) => c.phonecode)
                    .map((country) => (
                      <option key={country.isoCode} value={country.phonecode}>
                        +{country.phonecode} ({country.isoCode})
                      </option>
                    ))}
                </select>
                <input
                  type="tel"
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
                <option value="">Select your country</option>
                {allCountries.map((c) => (
                  <option key={c.isoCode} value={c.isoCode}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

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
                      ? "Select a state"
                      : "No states available"
                    : "Select a country first"}
                </option>
                {statesOfSelectedCountry.map((s) => (
                  <option key={s.isoCode} value={s.isoCode}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

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
                      ? "Select a city"
                      : "No cities available"
                    : "Select a state first"}
                </option>
                {citiesOfSelectedState.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

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
              disabled={isLoading}
            >
              {isLoading ? (
                <FaSpinner className="animate-spin mr-3 text-xl" />
              ) : (
                <FaCheckCircle className="mr-3 text-xl" />
              )}
              {isLoading ? "Registering..." : "Register Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
