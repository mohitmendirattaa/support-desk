import axios from "axios";

const API_URL = "http://localhost:5000/api/tickets/";

const createTicket = async (ticketData, token) => {
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

const ticketService = {
  createTicket,
  getTickets,
};

export default ticketService;
