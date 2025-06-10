import React, { useState, useEffect } from "react";
import { FaSignInAlt, FaSpinner, FaEye, FaEyeSlash } from "react-icons/fa";
import { login, reset } from "../features/auth/authSlice"; // Assuming 'login' and 'reset' are correct
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false); // State for password visibility

  const { email, password } = formData;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isError, isLoading, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      toast.error(message || "Login failed. Please check your credentials."); // Improved error message handling
    }

    if (isSuccess && user) {
      if (user.status === "inactive") {
        toast.error("Your account is awaiting admin approval. Please wait.");
        dispatch(reset());
        return;
      }
      toast.success(`Logged in as ${user?.name || user?.email}`);
      if (user.role === "admin") {
        navigate("/admin-dashboard"); 
      } else {
        navigate("/"); 
      }
    }

    if (!user || user.status === "active") {
      dispatch(reset());
    }
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onSubmit = (e) => {
    e.preventDefault();
    const userData = {
      email,
      password,
    };
    dispatch(login(userData))
      .unwrap()
      .then(() => {
        // Redirection and toast handled by useEffect
      })
      .catch(() => {
        // Error toast handled by useEffect
      });
  };

  const onChange = (e) => {
    setFormData((prevState) => {
      return {
        ...prevState,
        [e.target.name]: e.target.value,
      };
    });
  };

  // Function to toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-gray-50 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full text-center border border-gray-100 transform transition-all duration-300 hover:shadow-2xl mx-auto">
        <section className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 leading-tight flex items-center justify-center">
            <FaSignInAlt className="mr-3 text-indigo-600 text-3xl sm:text-4xl" />
            <span className="text-indigo-800">Login</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600">
            Please login to get support
          </p>
        </section>

        <section className="form">
          <form onSubmit={onSubmit}>
            <div className="mb-5">
              <input
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 text-base placeholder-gray-400"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={email}
                onChange={onChange}
                required
              />
            </div>
            <div className="mb-6 relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 text-base placeholder-gray-400 pr-10"
                id="password"
                name="password"
                placeholder="Enter password"
                value={password}
                onChange={onChange}
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-indigo-600 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <FaEyeSlash className="h-5 w-5" />
                ) : (
                  <FaEye className="h-5 w-5" />
                )}
              </button>
            </div>
            <div>
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
                  <FaSignInAlt className="mr-3 text-xl" />
                )}
                {isLoading ? "Logging In..." : "Submit"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

export default Login;
