import axios from "axios";

const API_URL = "http://localhost:5000/api/analytics/";

// Get ticket counts by status
const getTicketStatusAnalytics = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(API_URL + "tickets/status", config);
  return response.data;
};

// Get ticket counts by category
const getTicketCategoryAnalytics = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(API_URL + "tickets/category", config);
  return response.data;
};

// Get ticket counts by subCategory for a given main category
const getTicketSubCategoryAnalytics = async (category, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(
    API_URL + `tickets/subcategory/${category}`,
    config
  );
  return response.data;
};

// Get ticket counts by priority
const getTicketPriorityAnalytics = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(API_URL + "tickets/priority", config);
  return response.data;
};

// Get ticket creation trend over time
const getTicketsCreatedOverTimeAnalytics = async (
  timeframe = "30days",
  token
) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(
    API_URL + `tickets/overtime?timeframe=${timeframe}`,
    config
  );
  return response.data;
};

// Get total user count
const getTotalUserCountAnalytics = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(API_URL + "users/total", config);
  return response.data;
};

// Get ticket counts by ServiceType
const getTicketServiceTypeAnalytics = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(API_URL + "tickets/servicetype", config);
  return response.data;
};

const analyticService = {
  getTicketStatusAnalytics,
  getTicketCategoryAnalytics,
  getTicketSubCategoryAnalytics,
  getTicketPriorityAnalytics,
  getTicketsCreatedOverTimeAnalytics,
  getTotalUserCountAnalytics,
  getTicketServiceTypeAnalytics,
};

export default analyticService;
