const Analytic = require("../models/AnalyticModel");
const asyncHandler = require("express-async-handler");

const getTicketStatusAnalytics = asyncHandler(async (req, res) => {
  try {
    const data = await Analytic.getTicketsByStatus();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching ticket status analytics:", error);
    throw error; // Let asyncHandler catch and pass to global error handler
  }
});

const getTicketCategoryAnalytics = asyncHandler(async (req, res) => {
  try {
    const data = await Analytic.getTicketsByCategory();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching ticket category analytics:", error);
    throw error;
  }
});

const getTicketSubCategoryAnalytics = asyncHandler(async (req, res) => {
  const { category } = req.params;
  if (!category) {
    res.status(400);
    throw new Error("Category parameter is required.");
  }
  try {
    const data = await Analytic.getTicketsBySubCategory(category);
    res.status(200).json(data);
  } catch (error) {
    console.error(
      `Error fetching ticket subcategory analytics for ${category}:`,
      error
    );
    throw error;
  }
});

const getTicketPriorityAnalytics = asyncHandler(async (req, res) => {
  try {
    const data = await Analytic.getTicketCountsByPriority();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching ticket priority analytics:", error);
    throw error;
  }
});

const getTicketsCreatedOverTimeAnalytics = asyncHandler(async (req, res) => {
  const { timeframe } = req.query;

  try {
    const data = await Analytic.getTicketsCreatedOverTime(timeframe);
    const filledData = fillMissingDates(data, timeframe);
    res.status(200).json(filledData);
  } catch (error) {
    console.error(
      `Error fetching ticket creation over time (${timeframe}):`,
      error
    );
    throw error;
  }
});

const getTotalUserCountAnalytics = asyncHandler(async (req, res) => {
  try {
    const data = await Analytic.getTotalUserCount();
    res.status(200).json({ totalUsers: data });
  } catch (error) {
    console.error("Error fetching total user count analytics:", error);
    throw error;
  }
});

const getTicketServiceTypeAnalytics = asyncHandler(async (req, res) => {
  try {
    const data = await Analytic.getTicketsByServiceType();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching ticket ServiceType analytics:", error);
    throw error;
  }
});

function fillMissingDates(data, timeframe) {
  if (!data || data.length === 0) return [];

  const now = new Date();
  let startDate;

  switch (timeframe) {
    case "7days":
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case "30days":
      startDate = new Date(now.setDate(now.getDate() - 30));
      break;
    case "90days":
      startDate = new Date(now.setDate(now.getDate() - 90));
      break;
    case "year":
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    default:
      startDate = new Date(now.setDate(now.getDate() - 30));
  }

  startDate.setHours(0, 0, 0, 0);

  const dateMap = new Map(
    data.map((item) => [item.date.split("T")[0], item.count])
  );
  const filled = [];
  let currentDate = new Date(startDate);

  while (currentDate.getTime() <= new Date().getTime()) {
    const dateString = currentDate.toISOString().split("T")[0];
    filled.push({
      date: dateString,
      count: dateMap.get(dateString) || 0,
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return filled;
}

module.exports = {
  getTicketStatusAnalytics,
  getTicketCategoryAnalytics,
  getTicketSubCategoryAnalytics,
  getTicketPriorityAnalytics,
  getTicketsCreatedOverTimeAnalytics,
  getTotalUserCountAnalytics,
  getTicketServiceTypeAnalytics,
};
