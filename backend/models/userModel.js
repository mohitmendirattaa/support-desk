const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "please add a name"],
    },
    employeeCode: {
      type: Number,
      required: [true, "please add your employee code"],
    },
    contact: {
      type: String,
      required: [true, "please add a contact"],
    },
    email: {
      type: String,
      required: [true, "please add an email"], // Corrected "a email" to "an email"
      unique: true,
    },
    location: {
      type: String,
      required: [true, "please add a location"],
    },
    company: {
      type: String,
      required: [true, "please add a company"],
    },
    password: {
      type: String,
      required: [true, "please add a password"],
    },
    role: {
      type: String,
      enum: ["user", "admin"], // Defines allowed values for 'role'
      default: "user", // Sets 'user' as the default role
    },
    status: {
      type: String,
      enum: ["active", "inactive"], 
      default: "inactive", 
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
