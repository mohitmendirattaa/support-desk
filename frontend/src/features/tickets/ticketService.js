import axios from "axios";

const API_URL = "http://localhost:5000/api/tickets/";

const createTicket = async (ticketData, token) => {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  const res = await axios.post(API_URL, ticketData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

const getTickets = async (token) => {
  const res = await axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

const getTicket = async (ticketId, token) => {
  const res = await axios.get(API_URL + ticketId, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

// --- START OF MODIFICATION ---
const updateTicketStatus = async (ticketId, newStatus, reason, token) => {
  // <-- Added 'reason' parameter
  let endpointSuffix;
  let requestBody = {}; // Initialize the request body

  // Determine the endpoint and prepare the request body based on newStatus
  switch (newStatus) {
    case "closed":
      endpointSuffix = "close";
      requestBody = { reason }; // Send { reason: "..." }
      break;
    case "hold":
      endpointSuffix = "hold";
      requestBody = { reason }; // Send { reason: "..." }
      break;
    case "pending":
      endpointSuffix = "pending";
      requestBody = { reason }; // Send { reason: "..." }
      break;
    case "resolved":
      endpointSuffix = "resolved";
      requestBody = { reason }; // Send { reason: "..." }
      break;
    case "reopened":
      endpointSuffix = "reopen";
      requestBody = { reopenReason: reason }; // Important: backend expects 'reopenReason' for this endpoint
      break;
    default:
      throw new Error(`Invalid status for update: ${newStatus}.`);
  }

  const res = await axios.patch(
    API_URL + ticketId + "/" + endpointSuffix,
    requestBody, // <-- Pass the constructed requestBody here
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};
// --- END OF MODIFICATION ---

const getAllTicketsForAdmin = async (token) => {
  const res = await axios.get(API_URL + "admin/allTickets", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

const getSingleTicketAsAdmin = async (ticketId, token) => {
  const res = await axios.get(API_URL + "admin/" + ticketId, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

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
  updateTicketStatus, // Ensure this is exported
  getAllTicketsForAdmin,
  getSingleTicketAsAdmin,
  deleteTicket,
};

export default ticketService;
