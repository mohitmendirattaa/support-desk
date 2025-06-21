import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import noteService from "./noteService"; // Adjust path if necessary

// Get user token from localStorage (assuming your auth slice stores it there)
const getUserToken = (getState) => getState().auth.user.token;

const initialState = {
  notes: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
};

// Get ticket notes
export const getNotes = createAsyncThunk(
  "notes/getAll",
  async (ticketId, thunkAPI) => {
    try {
      const token = getUserToken(thunkAPI.getState);
      return await noteService.getNotes(ticketId, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create ticket note
export const createNote = createAsyncThunk(
  "notes/create",
  async ({ noteText, ticketId }, thunkAPI) => {
    try {
      const token = getUserToken(thunkAPI.getState);
      return await noteService.createNote(ticketId, noteText, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Reopen a ticket (moved from ticketSlice to be handled here for convenience,
// as the UI flow for reopening is closely tied to the ticket detail page where notes are)
// This action will update the ticket's status AND add a note
export const reopenTicket = createAsyncThunk(
  "tickets/reopen", // Keep 'tickets' prefix for consistency with ticket status change
  async ({ ticketId, reopenReason }, thunkAPI) => {
    try {
      const token = getUserToken(thunkAPI.getState);
      // Call the service function to reopen the ticket
      const response = await noteService.reopenTicket(
        ticketId,
        reopenReason,
        token
      );

      // After successful reopen, you might want to re-fetch the ticket
      // or update its status in the tickets slice directly.
      // For now, we'll rely on the re-fetch in Ticket.jsx useEffect.
      return response; // The backend returns { ticket: updatedTicket, note: newNote }
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const noteSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    reset: (state) => initialState, // Optional: for resetting notes state
  },
  extraReducers: (builder) => {
    builder
      // Get Notes
      .addCase(getNotes.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getNotes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.notes = action.payload; // Payload is an array of notes
      })
      .addCase(getNotes.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Create Note
      .addCase(createNote.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createNote.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.notes.unshift(action.payload); // Add new note to the beginning of the array
      })
      .addCase(createNote.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Reopen Ticket (handles status update and note addition implicitly)
      .addCase(reopenTicket.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(reopenTicket.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // The `reopenTicket` action on the frontend is mostly about triggering the backend logic
        // and updating the ticket state via the `ticketSlice`.
        // However, if the backend returns the new note, we can add it here too.
        if (action.payload && action.payload.note) {
          state.notes.unshift(action.payload.note); // Add the note returned from reopening
        }
        state.message =
          action.payload.message || "Ticket reopened successfully!";
      })
      .addCase(reopenTicket.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || "Failed to reopen ticket.";
      });
  },
});

export const { reset } = noteSlice.actions;
export default noteSlice.reducer;
