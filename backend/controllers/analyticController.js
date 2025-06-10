const Analytic = require("../models/analyticModel"); // Import the new AnalyticModel

/**
 * Helper function for common admin role check and error handling.
 */
const checkAdminAccess = (req, res, next) => {
  if (!req.user || !req.user.role || req.user.role !== "admin") {
    res.status(403);
    return next(new Error("Access forbidden. Admin role required."));
  }
};

/**
 * @desc Get ticket counts by status for analytics
 * @route GET /api/analytics/tickets/status
 * @access Private/Admin
 */
const getTicketStatusAnalytics = async (req, res, next) => {
  checkAdminAccess(req, res, next); // Ensure admin access
  if (res.headersSent) return; // Stop if checkAdminAccess already sent a response

  try {
    const data = await Analytic.getTicketsByStatus();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching ticket status analytics:", error);
    return next(error);
  }
};

/**
 * @desc Get ticket counts by category for analytics
 * @route GET /api/analytics/tickets/category
 * @access Private/Admin
 */
const getTicketCategoryAnalytics = async (req, res, next) => {
  checkAdminAccess(req, res, next); // Ensure admin access
  if (res.headersSent) return;

  try {
    const data = await Analytic.getTicketsByCategory();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching ticket category analytics:", error);
    return next(error);
  }
};

/**
 * @desc Get ticket counts by subCategory for a given main category for analytics
 * @route GET /api/analytics/tickets/subcategory/:category
 * @access Private/Admin
 */
const getTicketSubCategoryAnalytics = async (req, res, next) => {
  checkAdminAccess(req, res, next); // Ensure admin access
  if (res.headersSent) return;

  const { category } = req.params;
  if (!category) {
    res.status(400);
    return next(new Error("Category parameter is required."));
  }

  try {
    const data = await Analytic.getTicketsBySubCategory(category);
    res.status(200).json(data);
  } catch (error) {
    console.error(
      `Error fetching ticket subcategory analytics for ${category}:`,
      error
    );
    return next(error);
  }
};

/**
 * @desc Get ticket counts by priority for analytics
 * @route GET /api/analytics/tickets/priority
 * @access Private/Admin
 */
const getTicketPriorityAnalytics = async (req, res, next) => {
  checkAdminAccess(req, res, next); // Ensure admin access
  if (res.headersSent) return;

  try {
    const data = await Analytic.getTicketCountsByPriority();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching ticket priority analytics:", error);
    return next(error);
  }
};

/**
 * @desc Get ticket creation trend over time for analytics
 * @route GET /api/analytics/tickets/overtime?timeframe=30days
 * @access Private/Admin
 */
const getTicketsCreatedOverTimeAnalytics = async (req, res, next) => {
  checkAdminAccess(req, res, next); // Ensure admin access
  if (res.headersSent) return;

  const { timeframe } = req.query; // e.g., '7days', '30days', 'year'

  try {
    const data = await Analytic.getTicketsCreatedOverTime(timeframe);
    res.status(200).json(data);
  } catch (error) {
    console.error(
      `Error fetching ticket creation over time (${timeframe}):`,
      error
    );
    return next(error);
  }
};

/**
 * @desc Get total user count for analytics
 * @route GET /api/analytics/users/total
 * @access Private/Admin
 */
const getTotalUserCountAnalytics = async (req, res, next) => {
  checkAdminAccess(req, res, next); // Ensure admin access
  if (res.headersSent) return;

  try {
    const data = await Analytic.getTotalUserCount();
    res.status(200).json({ totalUsers: data }); // Wrap in an object for consistency
  } catch (error) {
    console.error("Error fetching total user count analytics:", error);
    return next(error);
  }
};

/**
 * @desc Get ticket counts by ServiceType for analytics
 * @route GET /api/analytics/tickets/servicetype
 * @access Private/Admin
 */
const getTicketServiceTypeAnalytics = async (req, res, next) => {
  checkAdminAccess(req, res, next); // Ensure admin access
  if (res.headersSent) return;

  try {
    const data = await Analytic.getTicketsByServiceType();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching ticket ServiceType analytics:", error);
    return next(error);
  }
};

module.exports = {
  getTicketStatusAnalytics,
  getTicketCategoryAnalytics,
  getTicketSubCategoryAnalytics,
  getTicketPriorityAnalytics,
  getTicketsCreatedOverTimeAnalytics,
  getTotalUserCountAnalytics,
  getTicketServiceTypeAnalytics,
};
