import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import analyticService from "./analyticService";

const initialState = {
  ticketsByStatus: [],
  ticketsByCategory: [],
  ticketsBySubCategory: [], // To store results for specific subcategories
  ticketsByPriority: [],
  ticketsCreatedOverTime: [],
  totalUsers: 0,
  ticketsByServiceType: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
};

// Async Thunks for each API call
// Get ticket counts by status
export const getTicketStatus = createAsyncThunk(
  "analytics/getTicketStatus",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await analyticService.getTicketStatusAnalytics(token);
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

// Get ticket counts by category
export const getTicketCategory = createAsyncThunk(
  "analytics/getTicketCategory",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await analyticService.getTicketCategoryAnalytics(token);
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

// Get ticket counts by subCategory (requires category as argument)
export const getTicketSubCategory = createAsyncThunk(
  "analytics/getTicketSubCategory",
  async (category, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      // You might want to store this by category, or just replace it.
      // For simplicity, this will just replace the current subcategory data.
      return await analyticService.getTicketSubCategoryAnalytics(
        category,
        token
      );
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

// Get ticket counts by priority
export const getTicketPriority = createAsyncThunk(
  "analytics/getTicketPriority",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await analyticService.getTicketPriorityAnalytics(token);
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

// Get tickets created over time
export const getTicketsCreatedOverTime = createAsyncThunk(
  "analytics/getTicketsCreatedOverTime",
  async (timeframe = "30days", thunkAPI) => {
    // Default timeframe
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await analyticService.getTicketsCreatedOverTimeAnalytics(
        timeframe,
        token
      );
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

// Get total user count
export const getTotalUsers = createAsyncThunk(
  "analytics/getTotalUsers",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await analyticService.getTotalUserCountAnalytics(token);
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

// Get ticket counts by ServiceType
export const getTicketServiceType = createAsyncThunk(
  "analytics/getTicketServiceType",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await analyticService.getTicketServiceTypeAnalytics(token);
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

export const analyticSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    reset: (state) => initialState, // A reset function for cleanup
  },
  extraReducers: (builder) => {
    builder
      // getTicketStatus
      .addCase(getTicketStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTicketStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.ticketsByStatus = action.payload;
      })
      .addCase(getTicketStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.ticketsByStatus = []; // Clear data on error
      })
      // getTicketCategory
      .addCase(getTicketCategory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTicketCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.ticketsByCategory = action.payload;
      })
      .addCase(getTicketCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.ticketsByCategory = [];
      })
      // getTicketSubCategory
      .addCase(getTicketSubCategory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTicketSubCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.ticketsBySubCategory = action.payload;
      })
      .addCase(getTicketSubCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.ticketsBySubCategory = [];
      })
      // getTicketPriority
      .addCase(getTicketPriority.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTicketPriority.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.ticketsByPriority = action.payload;
      })
      .addCase(getTicketPriority.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.ticketsByPriority = [];
      })
      // getTicketsCreatedOverTime
      .addCase(getTicketsCreatedOverTime.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTicketsCreatedOverTime.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.ticketsCreatedOverTime = action.payload;
      })
      .addCase(getTicketsCreatedOverTime.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.ticketsCreatedOverTime = [];
      })
      // getTotalUsers
      .addCase(getTotalUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTotalUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.totalUsers = action.payload.totalUsers; // Assuming backend returns { totalUsers: N }
      })
      .addCase(getTotalUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.totalUsers = 0;
      })
      // getTicketServiceType
      .addCase(getTicketServiceType.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTicketServiceType.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.ticketsByServiceType = action.payload;
      })
      .addCase(getTicketServiceType.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.ticketsByServiceType = [];
      });
  },
});

export const { reset } = analyticSlice.actions;
export default analyticSlice.reducer;
