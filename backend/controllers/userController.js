const User = require("../models/userModel"); // Our MSSQL-compatible UserModel
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Helper function to validate GUID format
const isValidGuid = (id) => {
  // Regex for a standard GUID format (xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx)
  const guidRegex =
    /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
  return typeof id === "string" && guidRegex.test(id);
};

// @desc    Register a new user
// @route   /api/users
// @access  Public
const registerUser = async (req, res, next) => {
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
    res.status(400);
    return next(new Error("Please include all fields"));
  }

  try {
    const emailExist = await User.findByEmail(email);
    if (emailExist) {
      res.status(400);
      return next(new Error("User with that email already exists."));
    }

    // employeeCode uniqueness is handled by the UNIQUE constraint in the SQL table
    // and caught in the UserModel.create method. No explicit check needed here if DB handles it.

    const user = await User.create({
      name,
      email,
      password,
      contact,
      employeeCode,
      location,
      company,
      status: "active", // <-- NEW: Explicitly set status to "active"
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
        token: generateToken(user.id),
      });
    } else {
      res.status(500);
      return next(new Error("User registration failed. Please try again."));
    }
  } catch (error) {
    console.error("Register User Error:", error);
    return next(error);
  }
};

// @desc    Authenticate a user
// @route   /api/users/login
// @access  Public
const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    return next(new Error("Please enter all fields."));
  }

  try {
    const user = await User.findByEmail(email);

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
        token: generateToken(user.id),
      });
    } else {
      res.status(400);
      return next(new Error("Invalid credentials"));
    }
  } catch (error) {
    console.error("Login User Error:", error);
    return next(error);
  }
};

// @desc    Get all users (Admin only)
// @route   /api/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403);
    return next(new Error("Not authorized. Admin privileges required."));
  }

  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    console.error("Get All Users Error:", error);
    res.status(500);
    return next(new Error("Could not retrieve users."));
  }
};

// @desc    Get a single user by ID (Admin only)
// @route   /api/users/:id
// @access  Private/Admin
const getSingleUser = async (req, res, next) => {
  const userId = req.params.id; // Get the ID from parameters

  // --- NEW VALIDATION STEP FOR GUID FORMAT ---
  if (!isValidGuid(userId)) {
    res.status(400); // Bad Request
    return next(
      new Error("Invalid user ID format. Please provide a valid GUID.")
    );
  }
  // --- END NEW VALIDATION STEP ---

  if (!req.user || req.user.role !== "admin") {
    res.status(403);
    return next(new Error("Not authorized. Admin privileges required."));
  }

  try {
    const user = await User.findById(userId); // Use the validated userId
    if (!user) {
      res.status(404);
      return next(new Error("User not found."));
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Get Single User Error:", error);
    res.status(500);
    return next(new Error("Could not retrieve user due to a server error."));
  }
};

// @desc    Update user status (Admin only)
// @route   PUT /api/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  // --- NEW VALIDATION STEP FOR GUID FORMAT ---
  if (!isValidGuid(id)) {
    res.status(400);
    return next(
      new Error("Invalid user ID format. Please provide a valid GUID.")
    );
  }
  // --- END NEW VALIDATION STEP ---

  if (!status || !["active", "inactive"].includes(status)) {
    res.status(400);
    return next(
      new Error(
        "Invalid status provided. Status must be 'active' or 'inactive'."
      )
    );
  }

  if (!req.user || req.user.role !== "admin") {
    res.status(403);
    return next(
      new Error(
        "Not authorized to update user status. Admin privileges required."
      )
    );
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      res.status(404);
      return next(new Error("User not found."));
    }

    const updatedUser = await User.update(id, { status });

    if (!updatedUser) {
      res.status(500);
      return next(new Error("Failed to update user status."));
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Update User Status Error:", error);
    res.status(500);
    return next(new Error("Failed to update user status."));
  }
};

const updateUser = async (req, res, next) => {
  const { id } = req.params;

  // --- NEW VALIDATION STEP FOR GUID FORMAT ---
  if (!isValidGuid(id)) {
    res.status(400);
    return next(
      new Error("Invalid user ID format. Please provide a valid GUID.")
    );
  }
  // --- END NEW VALIDATION STEP ---

  const { name, email, contact, employeeCode, location, company, role } =
    req.body;

  const isUpdatingSelf = req.user && req.user.id === id;
  const isAdmin = req.user && req.user.role === "admin";

  if (!isUpdatingSelf && !isAdmin) {
    res.status(403);
    return next(new Error("Not authorized to update user details."));
  }

  try {
    const user = await User.findById(id);

    if (!user) {
      res.status(404);
      return next(new Error("User not found."));
    }

    if (email && email !== user.email) {
      const emailExist = await User.findByEmail(email);
      if (emailExist) {
        res.status(400);
        return next(new Error("Another user with that email already exists."));
      }
    }

    if (employeeCode && employeeCode !== user.employeeCode) {
      const employeeCodeExist = await User.findByEmployeeCode(employeeCode);
      if (employeeCodeExist) {
        res.status(400);
        return next(
          new Error("Another user with that employee code already exists.")
        );
      }
    }

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (email !== undefined) updateFields.email = email;
    if (contact !== undefined) updateFields.contact = contact;
    if (employeeCode !== undefined) updateFields.employeeCode = employeeCode;
    if (location !== undefined) updateFields.location = location;
    if (company !== undefined) updateFields.company = company;

    if (isAdmin) {
      if (role !== undefined) {
        if (!["user", "admin"].includes(role)) {
          res.status(400);
          return next(
            new Error("Invalid role provided. Role must be 'user' or 'admin'.")
          );
        }
        updateFields.role = role;
      }
    }

    const updatedUser = await User.update(id, updateFields);

    if (!updatedUser) {
      res.status(400);
      return next(
        new Error("User update failed. Please check the provided data.")
      );
    }

    res.status(200).json({
      _id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      employeeCode: updatedUser.employeeCode,
      contact: updatedUser.contact,
      company: updatedUser.company,
      location: updatedUser.location,
      role: updatedUser.role,
      status: updatedUser.status,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    });
  } catch (error) {
    console.error("Update User Error:", error);
    return next(error);
  }
};

// @desc    Get current user data
// @route   /api/users/me
// @access  Private
const getMe = async (req, res) => {
  const user = {
    id: req?.user?.id,
    name: req?.user?.name,
    email: req?.user?.email,
    employeeCode: req?.user?.employeeCode,
    contact: req?.user?.contact,
    location: req?.user?.location,
    company: req?.user?.company,
    role: req?.user?.role,
    status: req?.user?.status,
    createdAt: req?.user?.createdAt,
  };
  res.status(200).json(user);
};

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  getAllUsers,
  getSingleUser,
  updateUserStatus,
  updateUser,
};

/* const User = require("../models/userModel");
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
 */
