import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import ticketService from "./ticketService"; // Ensure this path is correct and ticketService has `deleteTicket`

// Helper function to extract error message
const getErrorMessage = (error) => {
  return (
    (error.response && error.response.data && error.response.data.message) ||
    error.message ||
    error.toString()
  );
};

const initialState = {
  tickets: [],
  ticket: {},
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
};

// Async Thunks
export const createTicket = createAsyncThunk(
  "ticket/create",
  async (ticketData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await ticketService.createTicket(ticketData, token);
    } catch (error) {
      const message = getErrorMessage(error); // Using the helper
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getTickets = createAsyncThunk(
  "tickets/getAll",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await ticketService.getTickets(token);
    } catch (error) {
      const message = getErrorMessage(error); // Using the helper
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getTicket = createAsyncThunk(
  "tickets/get",
  async (ticketId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await ticketService.getTicket(ticketId, token);
    } catch (error) {
      const message = getErrorMessage(error); // Using the helper
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getSingleTicketAsAdmin = createAsyncThunk(
  "tickets/getSingleAsAdmin",
  async (ticketId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await ticketService.getSingleTicketAsAdmin(ticketId, token);
    } catch (error) {
      const message = getErrorMessage(error); // Using the helper
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const closeTicket = createAsyncThunk(
  "ticket/close",
  async (ticketId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await ticketService.closeTicket(ticketId, token);
    } catch (error) {
      const message = getErrorMessage(error); // Using the helper
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getAllTicketsForAdmin = createAsyncThunk(
  "tickets/getAllForAdmin",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      const user = thunkAPI.getState().auth.user;
      // Client-side role check for an extra layer of security and UX
      if (!user || user.role !== "admin") {
        return thunkAPI.rejectWithValue(
          "Not authorized to view all tickets. Admin access required."
        );
      }
      return await ticketService.getAllTicketsForAdmin(token);
    } catch (error) {
      const message = getErrorMessage(error); // Using the helper
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// New Thunk for deleting a ticket
export const deleteTicket = createAsyncThunk(
  "ticket/delete",
  async (ticketId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      // Assuming your ticketService.deleteTicket function exists and works
      await ticketService.deleteTicket(ticketId, token);
      return ticketId; // Return the ID of the deleted ticket for state update
    } catch (error) {
      const message = getErrorMessage(error); // Using the helper
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const ticketSlice = createSlice({
  name: "ticket",
  initialState,
  reducers: {
    // Reset function
    reset: (state) => {
      // It's safer to reset to the initial state completely for clarity
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      // createTicket cases
      .addCase(createTicket.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(createTicket.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = "Ticket created successfully!";
        // You might want to add the new ticket to the tickets array if desired
        // state.tickets.push(action.payload);
      })
      .addCase(createTicket.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.isSuccess = false;
      })
      // getTickets cases (for user's own tickets)
      .addCase(getTickets.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "";
        state.tickets = []; // Clear previous tickets
        state.ticket = {}; // Clear single ticket
      })
      .addCase(getTickets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = "";
        state.tickets = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getTickets.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.isSuccess = false;
        state.tickets = [];
      })
      // getTicket cases (for user's single ticket)
      .addCase(getTicket.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "";
        state.ticket = {}; // Clear previous single ticket
      })
      .addCase(getTicket.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = "";
        state.ticket = action.payload;
      })
      .addCase(getTicket.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.isSuccess = false;
        state.ticket = {};
      })
      // getSingleTicketAsAdmin cases
      .addCase(getSingleTicketAsAdmin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getSingleTicketAsAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.ticket = action.payload;
      })
      .addCase(getSingleTicketAsAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.ticket = null; // Set to null if not found or error
      })
      // closeTicket cases
      .addCase(closeTicket.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(closeTicket.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = "Ticket closed successfully!";
        // Update the status of the closed ticket in the 'tickets' array
        state.tickets = state.tickets.map((ticket) =>
          ticket.id === action.payload.id
            ? { ...ticket, status: "closed" }
            : ticket
        );
        // Also update the single 'ticket' if it's the one being closed
        if (state.ticket && state.ticket.id === action.payload.id) {
          state.ticket.status = "closed";
        }
      })
      .addCase(closeTicket.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.isSuccess = false;
      })
      // getAllTicketsForAdmin cases
      .addCase(getAllTicketsForAdmin.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "";
        state.tickets = []; // Clear previous tickets
        state.ticket = {}; // Clear single ticket
      })
      .addCase(getAllTicketsForAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = "";
        state.tickets = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getAllTicketsForAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.isSuccess = false;
        state.tickets = [];
      })
      // deleteTicket cases (NEWLY ADDED)
      .addCase(deleteTicket.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.message = "";
      })
      .addCase(deleteTicket.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = `Ticket ${action.payload} deleted successfully!`;
        // Filter out the deleted ticket from the tickets array
        // Changed `ticket._id` to `ticket.id` to match MS SQL Server's primary key name
        state.tickets = state.tickets.filter(
          (ticket) => ticket.id !== action.payload
        );
      })
      .addCase(deleteTicket.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.isSuccess = false;
      });
  },
});

export const { reset } = ticketSlice.actions;
export default ticketSlice.reducer;
