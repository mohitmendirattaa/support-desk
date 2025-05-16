const mongoose = require("mongoose");

const ticketSchema = mongoose.Schema(
  {
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
    /*   product: {
      type: String,
      // required: [true, "Please select a product"],
      enum: ["iPhone", "MacBook Pro", "iMac", "iPad"],
    }, */
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
    module: {
      type: String,
      required: [true, "Please select the module"],
      enum: ["MM", "SD", "FI", "PP", "PM", "PS", "QM", "Other"],
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
  }
);

const Ticket = mongoose.model("Ticket", ticketSchema);

module.exports = Ticket;
