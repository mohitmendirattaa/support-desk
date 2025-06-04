const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  const { name, email, password, contact, employeeCode, location, company } =
    req.body;
  if (
    !name ||
    !email ||
    !password ||
    !contact ||
    !employeeCode ||
    !location ||
    !company
  ) {
    res.status(401);
    throw new Error("Please include all fields");
  }
  try {
    const emailExist = await User.findOne({ email });
    if (emailExist) {
      res.status(400);
      throw new Error("User with that email already exists.");
    }

    const employeeCodeExist = await User.findOne({ employeeCode });
    if (employeeCodeExist) {
      res.status(400);
      throw new Error("User with that employee code already exists.");
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    const user = await User.create({
      name,
      email,
      password: hash,
      contact,
      employeeCode,
      location,
      company,
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        employeeCode: user.employeeCode,
        contact: user.contact,
        company: user.company,
        location: user.location,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error("User registration failed. Please try again.");
    }
  } catch (error) {
    // It's good practice to log the actual error for debugging
    console.error("Register User Error:", error);
    res.status(400);
    throw new Error("User registration failed. Please try again.");
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.status(200).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      employeeCode: user.employeeCode,
      contact: user.contact,
      company: user.company,
      location: user.location,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid credentials");
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    console.error("Get All Users Error:", error);
    res.status(500);
    throw new Error("Could not retrieve users.");
  }
};

const getSingleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found.");
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Get Single User Error:", error);
    if (error.name === "CastError") {
      res.status(400);
      throw new Error("Invalid user ID format.");
    }
    res.status(500);
    throw new Error("Could not retrieve user.");
  }
};

const updateUserStatus = async (req, res) => {
  const { id } = req.params; 
  const { status } = req.body; 

  if (!status || !["active", "inactive"].includes(status)) {
    res.status(400);
    throw new Error(
      "Invalid status provided. Status must be 'active' or 'inactive'."
    );
  }
  if (!req.user || req.user.role !== "admin") {
    res.status(403); // Forbidden
    throw new Error(
      "Not authorized to update user status. Admin privileges required."
    );
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      res.status(404);
      throw new Error("User not found.");
    }
    user.status = status;
    const updatedUser = await user.save(); 
    res.status(200).json(updatedUser); 
  } catch (error) {
    console.error("Update User Status Error:", error);
    if (error.name === "CastError") {
      res.status(400);
      throw new Error("Invalid user ID format.");
    }
    res.status(500);
    throw new Error("Failed to update user status.");
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  // Destructure allowed fields from req.body.
  // Importantly, exclude '_id', 'createdAt', and 'status' from ever being directly updated.
  const {
    name,
    email,
    contact,
    employeeCode,
    location,
    company,
    role,
    // Do NOT include _id, createdAt, status here
    // password, // If you ever allow password updates via this route, handle separately
  } = req.body;

  // --- Authorization Check (Crucial) ---
  // Only allow admin to update other user details
  if (!req.user || req.user.role !== "admin") {
    res.status(403); // Forbidden
    throw new Error(
      "Not authorized to update user details. Admin privileges required."
    );
  }

  try {
    const user = await User.findById(id);

    if (!user) {
      res.status(404);
      throw new Error("User not found.");
    }

    if (email && email !== user.email) {
      const emailExist = await User.findOne({ email });
      if (emailExist) {
        res.status(400);
        throw new Error("Another user with that email already exists.");
      }
    }

    if (employeeCode && employeeCode !== user.employeeCode) {
      const employeeCodeExist = await User.findOne({ employeeCode });
      if (employeeCodeExist) {
        res.status(400);
        throw new Error("Another user with that employee code already exists.");
      }
    }

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (email !== undefined) updateFields.email = email;
    if (contact !== undefined) updateFields.contact = contact;
    if (employeeCode !== undefined) updateFields.employeeCode = employeeCode;
    if (location !== undefined) updateFields.location = location;
    if (company !== undefined) updateFields.company = company;

    if (role !== undefined && req.user.role === "admin") {
      updateFields.role = role;
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateFields }, // Use $set to update only specified fields
      { new: true, runValidators: true } // `new: true` returns the updated document
      // `runValidators: true` runs schema validators on update
    );

    // If for some reason update failed (e.g., validators prevented it)
    if (!updatedUser) {
      res.status(400);
      throw new Error("User update failed. Please check the provided data.");
    }

    // --- Respond with the updated user data (excluding sensitive/unmodifiable fields for client) ---
    res.status(200).json({
      _id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      employeeCode: updatedUser.employeeCode,
      contact: updatedUser.contact,
      company: updatedUser.company,
      location: updatedUser.location,
      role: updatedUser.role,
      status: updatedUser.status, // Always include status from the actual DB value
      createdAt: updatedUser.createdAt,
      // Do not send password or token here
    });
  } catch (error) {
    console.error("Update User Error:", error);
    if (error.name === "CastError") {
      res.status(400);
      throw new Error("Invalid user ID format.");
    }
    // For other validation errors or custom errors
    if (res.statusCode === 200) {
      // If status hasn't been explicitly set by us for a specific error
      res.status(400); // Bad Request for general update failures
    }
    throw new Error(error.message || "Failed to update user.");
  }
};

const getMe = async (req, res) => {
  const user = {
    id: req?.user?.id,
    name: req?.user?.name,
    email: req?.user?.email,
    role: req?.user?.role,
    status: req?.user?.status,
  };
  res.status(200).json(user);
};

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

module.exports = { registerUser, loginUser, getMe, getAllUsers, getSingleUser, updateUserStatus, updateUser };
