// frontend/src/services/noteService.js
import axios from "axios";

const API_URL = "http://localhost:5000/api/tickets/"; // Base URL for tickets, notes will be nested under it

// Get notes for a ticket
const getNotes = async (ticketId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(API_URL + ticketId + "/notes", config);

  return response.data;
};

// Create a new note for a ticket
const createNote = async (ticketId, noteText, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(
    API_URL + ticketId + "/notes",
    { text: noteText },
    config
  );

  return response.data;
};

// Reopen a ticket (keeping it here as per your request)
const reopenTicket = async (ticketId, reopenReason, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // ***** THE ONLY CHANGE: Change axios.put to axios.patch *****
  const response = await axios.patch(
    // <-- CHANGED FROM .put TO .patch
    API_URL + ticketId + "/reopen",
    { reopenReason },
    config
  );

  return response.data;
};

const noteService = {
  getNotes,
  createNote,
  reopenTicket, // Keep this exported
};

export default noteService;
