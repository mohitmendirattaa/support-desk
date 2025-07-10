import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import ticketService from "./ticketService";

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

const createTicket = createAsyncThunk(
  "ticket/create",
  async (ticketData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await ticketService.createTicket(ticketData, token);
    } catch (error) {
      const message = getErrorMessage(error);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const getTickets = createAsyncThunk("tickets/getAll", async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    return await ticketService.getTickets(token);
  } catch (error) {
    const message = getErrorMessage(error);
    return thunkAPI.rejectWithValue(message);
  }
});

const getTicket = createAsyncThunk(
  "tickets/get",
  async (ticketId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await ticketService.getTicket(ticketId, token);
    } catch (error) {
      const message = getErrorMessage(error);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const getSingleTicketAsAdmin = createAsyncThunk(
  "tickets/getSingleAsAdmin",
  async (ticketId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await ticketService.getSingleTicketAsAdmin(ticketId, token);
    } catch (error) {
      const message = getErrorMessage(error);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// --- START OF MODIFICATION ---
const updateTicketStatus = createAsyncThunk(
  "ticket/updateStatus",
  async ({ ticketId, newStatus, reason }, thunkAPI) => {
    // Added 'reason' to the destructured payload
    try {
      const token = thunkAPI.getState().auth.user.token;
      // Pass 'reason' to the service function
      return await ticketService.updateTicketStatus(
        ticketId,
        newStatus,
        reason,
        token
      );
    } catch (error) {
      const message = getErrorMessage(error);
      return thunkAPI.rejectWithValue(message);
    }
  }
);
// --- END OF MODIFICATION ---

const getAllTicketsForAdmin = createAsyncThunk(
  "tickets/getAllForAdmin",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      const user = thunkAPI.getState().auth.user;
      if (!user || user.role !== "admin") {
        return thunkAPI.rejectWithValue(
          "Not authorized to view all tickets. Admin access required."
        );
      }
      return await ticketService.getAllTicketsForAdmin(token);
    } catch (error) {
      const message = getErrorMessage(error);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const deleteTicket = createAsyncThunk(
  "ticket/delete",
  async (ticketId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      await ticketService.deleteTicket(ticketId, token);
      return ticketId;
    } catch (error) {
      const message = getErrorMessage(error);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const ticketSlice = createSlice({
  name: "ticket",
  initialState,
  reducers: {
    reset: (state) => {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
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
      })
      .addCase(createTicket.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.isSuccess = false;
      })
      .addCase(getTickets.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "";
        state.tickets = [];
        state.ticket = {};
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
      .addCase(getTicket.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "";
        state.ticket = {};
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
        state.ticket = null;
      })
      .addCase(updateTicketStatus.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(updateTicketStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = `Ticket status updated to '${action.payload.status}' successfully!`;

        state.tickets = state.tickets.map((ticket) =>
          ticket.id === action.payload.id
            ? { ...ticket, status: action.payload.status }
            : ticket
        );
        if (state.ticket && state.ticket.id === action.payload.id) {
          state.ticket.status = action.payload.status;
          state.ticket.updatedAt = action.payload.updatedAt;
        }
      })
      .addCase(updateTicketStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.isSuccess = false;
      })
      .addCase(getAllTicketsForAdmin.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "";
        state.tickets = [];
        state.ticket = {};
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

export {
  createTicket,
  getTickets,
  getTicket,
  getSingleTicketAsAdmin,
  updateTicketStatus,
  getAllTicketsForAdmin,
  deleteTicket,
};

export default ticketSlice.reducer;
