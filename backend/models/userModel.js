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
      required: [true, "please add a email"],
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
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
