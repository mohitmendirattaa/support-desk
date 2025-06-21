// This file remains the same as previously provided
// backend/services/noteService.js
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

// Reopen a ticket (this is actually part of ticket actions, but we put it in noteController)
// For consistency, let's also define it here as it uses the same API structure
const reopenTicket = async (ticketId, reopenReason, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // Note: The API endpoint for reopen is /api/tickets/:ticketId/reopen
  const response = await axios.put(
    API_URL + ticketId + "/reopen",
    { reopenReason },
    config
  );

  return response.data;
};

const noteService = {
  getNotes,
  createNote,
  reopenTicket, // Add reopenTicket to the service
};

export default noteService;
