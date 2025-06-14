import axios from "axios";

const API_URL = "http://localhost:5000/api/tickets/";

// Function to create a new ticket, now handles FormData for file uploads
const createTicket = async (ticketData, token) => {
  // Add a delay to simulate network latency, useful for testing loading states
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // When sending files, the `ticketData` should be a FormData object.
  // axios automatically sets the 'Content-Type' to 'multipart/form-data' when it detects FormData.
  const res = await axios.post(API_URL, ticketData, {
    headers: {
      Authorization: `Bearer ${token}`,
      // No need to explicitly set 'Content-Type': 'multipart/form-data' here,
      // axios handles it automatically when 'ticketData' is a FormData object.
    },
  });
  return res.data;
};

// Function to get all tickets for the authenticated user
const getTickets = async (token) => {
  const res = await axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

// Function to get a single ticket by its ID for the authenticated user
const getTicket = async (ticketId, token) => {
  const res = await axios.get(API_URL + ticketId, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

// Function to close a ticket (updates its status to "closed")
// This also needs to send FormData because the backend `updateTicket` controller
// is configured with `upload.single('file')` middleware.
const closeTicket = async (ticketId, token) => {
  // Create a FormData object even for simple status updates if the backend expects multipart/form-data
  const updateData = new FormData();
  updateData.append("status", "closed");

  const res = await axios.put(
    API_URL + ticketId,
    updateData, // Send FormData
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

// Function to get all tickets for admin users
const getAllTicketsForAdmin = async (token) => {
  const res = await axios.get(API_URL + "admin/allTickets", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

// Function to get a single ticket for admin users
const getSingleTicketAsAdmin = async (ticketId, token) => {
  const res = await axios.get(API_URL + "admin/" + ticketId, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

// Function to delete a ticket
const deleteTicket = async (ticketId, token) => {
  const res = await axios.delete(API_URL + ticketId, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

const ticketService = {
  createTicket,
  getTickets,
  getTicket,
  closeTicket,
  getAllTicketsForAdmin,
  getSingleTicketAsAdmin,
  deleteTicket,
};

export default ticketService;
