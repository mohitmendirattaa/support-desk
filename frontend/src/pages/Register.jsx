import React, { useEffect, useState } from "react";
import { FaUser } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { register, reset } from "../features/auth/authSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { COUNTRY_CODE_SELECT_OPTIONS } from "../constrants/formOptions";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password2: "",
    countryCode: "91",
    phoneNumber: "",
    employeeCode: "",
    location: "",
    company: "",
  });

  const {
    name,
    email,
    password,
    password2,
    countryCode,
    phoneNumber,
    employeeCode,
    location,
    company,
  } = formData;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isError, isLoading, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess || user) {
      navigate("/");
    }

    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onSubmit = (e) => {
    e.preventDefault();

    if (password !== password2) {
      toast.error("Passwords do not match");
      return;
    }

    const contact = `+${countryCode} ${phoneNumber}`;

    if (
      !name ||
      !email ||
      !password ||
      !contact ||
      !employeeCode ||
      !location ||
      !company
    ) {
      toast.error("Please include all fields");
      return;
    }

    const userData = {
      name,
      email,
      password,
      contact,
      employeeCode,
      location,
      company,
    };

    dispatch(register(userData))
      .unwrap()
      .then((data) => {
        toast.success("User registered successfully");
        navigate("/");
      })
      .catch((error) => {
        toast.error(error || "Registration failed. Please try again.");
      });
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <>
      <section className="heading">
        <h1>
          <FaUser />
          Register
        </h1>
        <p>Please create an account</p>
      </section>

      <section className="form">
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              placeholder="Enter your Full Name"
              value={name}
              onChange={onChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              id="employeeCode"
              name="employeeCode"
              placeholder="Enter your employee code"
              value={employeeCode}
              onChange={onChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              placeholder="Enter your Email"
              value={email}
              onChange={onChange}
              required
            />
          </div>
          <div
            className="form-group contact-group"
            style={{ display: "flex", alignItems: "flex-start" }}
          >
            <select
              name="countryCode"
              id="countryCode"
              className="form-control"
              value={countryCode}
              onChange={onChange}
              required
              style={{
                width: "30%",
                marginRight: "5px",
              }}
            >
              {COUNTRY_CODE_SELECT_OPTIONS.map((item, index) => {
                if (item.group) {
                  return (
                    <optgroup key={index} label={item.group}>
                      {item.options.map((option) => (
                        <option
                          key={option.value}
                          value={option.value}
                          data-countrycode={option.countryCode}
                        >
                          {option.label}
                        </option>
                      ))}
                    </optgroup>
                  );
                } else {
                  return (
                    <option
                      key={item.value}
                      value={item.value}
                      data-countrycode={item.countryCode}
                    >
                      {item.label}
                    </option>
                  );
                }
              })}
            </select>
            <input
              type="tel"
              className="form-control"
              id="phoneNumber"
              name="phoneNumber"
              placeholder="Enter phone number"
              value={phoneNumber}
              onChange={onChange}
              required
              style={{
                flexGrow: 1,
              }}
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              id="location"
              name="location"
              placeholder="Enter your location"
              value={location}
              onChange={onChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              id="company"
              name="company"
              placeholder="Enter your company name"
              value={company}
              onChange={onChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              placeholder="Enter password"
              value={password}
              onChange={onChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              className="form-control"
              id="password2"
              name="password2"
              placeholder="Confirm password"
              value={password2}
              onChange={onChange}
              required
            />
          </div>
          <div className="form-group">
            <button type="submit" className="btn btn-block">
              Submit
            </button>
          </div>
        </form>
      </section>
    </>
  );
}

export default Register;
