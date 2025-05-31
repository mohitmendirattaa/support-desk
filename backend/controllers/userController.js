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
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error("User registration failed. Please try again.");
    }
  } catch (error) {
    res.status(400);
    throw new Error("User registration failed. Please try again.");
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({
    email,
  });
  // console.log(user);
  if (user && (await bcrypt.compare(password, user.password))) {
    res.status(200).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      employeeCode: user.employeeCode,
      contact: user.contact,
      company: user.company,
      location: user.location,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid credentials");
  }
};

const getMe = async (req, res) => {
  const user = {
    id: req?.user?.id,
    name: req?.user?.name,
    email: req?.user?.email,
  };
  res.status(200).json(user);
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

module.exports = { registerUser, loginUser, getMe };
