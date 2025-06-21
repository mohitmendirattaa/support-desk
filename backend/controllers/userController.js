const User = require("../models/userModel");
const Log = require("../models/logModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const isValidGuid = (id) => {
  const guidRegex =
    /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
  return typeof id === "string" && guidRegex.test(id);
};

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

    const user = await User.create({
      name,
      email,
      password,
      contact,
      employeeCode,
      location,
      company,
      status: "active",
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

const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    return next(new Error("Please enter all fields."));
  }

  try {
    const user = await User.findByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      // Log the Login event: Now only passing UserID and Action
      await Log.createLogEntry(user.id, "Login");

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

const logoutUser = async (req, res, next) => {
  console.log("--> logoutUser function initiated."); // Add this line
  if (!req.user || !req.user.id) {
    console.log("--> Error: req.user not available or invalid ID for logout."); // Add this line
    res.status(401);
    return next(new Error("Not authorized. No user found for logout."));
  }

  console.log("--> User found for logout:", req.user.id); // Add this line

  try {
    await Log.createLogEntry(req.user.id, "Logout");
    console.log("--> Log.createLogEntry called successfully for logout."); // Add this line

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("--> FATAL: Logout User Error in catch block:", error); // Add this line
    res.status(200).json({
      message: "Logged out successfully, but logging failed internally.",
    });
  }
  console.log("--> logoutUser function completed."); // Add this line
};

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

const getSingleUser = async (req, res, next) => {
  const userId = req.params.id;

  if (!isValidGuid(userId)) {
    res.status(400);
    return next(
      new Error("Invalid user ID format. Please provide a valid GUID.")
    );
  }

  if (!req.user || req.user.role !== "admin") {
    res.status(403);
    return next(new Error("Not authorized. Admin privileges required."));
  }

  try {
    const user = await User.findById(userId);
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

const updateUserStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!isValidGuid(id)) {
    res.status(400);
    return next(
      new Error("Invalid user ID format. Please provide a valid GUID.")
    );
  }

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

  if (!isValidGuid(id)) {
    res.status(400);
    return next(
      new Error("Invalid user ID format. Please provide a valid GUID.")
    );
  }

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

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  getAllUsers,
  getSingleUser,
  updateUserStatus,
  updateUser,
};
