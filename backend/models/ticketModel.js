const mongoose = require("mongoose");

const ticketSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    description: {
      type: String,
      required: [true, "Please enter a description of the issue"],
    },
    status: {
      type: String,
      enum: ["new", "open", "closed"],
      default: "new",
    },
    service: {
      type: String,
      required: [true, "Please select service"],
      enum: ["Incident", "Service"],
    },
    category: {
      type: String,
      required: [true, "Please select a category"],
      enum: ["Digital", "SAP"],
    },
    priority: {
      type: String,
      required: [true, "Please select the priority"],
      enum: ["High", "Medium", "Low"],
    },
    subCategory: {
      // Renamed from 'module' to 'subCategory'
      type: String,
      required: [true, "Please select the subcategory"],
      //  NO ENUM HERE -  Will be dynamic
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
    _id: false,
  }
);

ticketSchema.path("subCategory").validate(function (value) {
  const validSAPModules = ["MM", "SD", "FI", "PP", "PM", "PS", "QM", "Other"];
  const validDigitalPlatforms = ["Platform 1", "Platform 2", "Platform 3"]; //  Add your Digital platform names
  if (this.category === "SAP") {
    return validSAPModules.includes(value);
  } else if (this.category === "Digital") {
    return validDigitalPlatforms.includes(value);
  }
  return false; //  Should not happen, but default to invalid
}, "Invalid subcategory for the selected category.");

const Ticket = mongoose.model("Ticket", ticketSchema);

module.exports = Ticket;
