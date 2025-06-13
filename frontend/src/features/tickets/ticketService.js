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

const closeTicket = async (ticketId, token) => {
  const res = await axios.put(
    API_URL + ticketId,
    { status: "closed" },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

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
  closeTicket,
  getAllTicketsForAdmin,
  getSingleTicketAsAdmin,
  deleteTicket,
};

export default ticketService;
