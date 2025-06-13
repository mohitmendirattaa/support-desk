const Analytic = require("../models/analyticModel"); // Corrected to AnalyticModel (capital A and M as per standard naming)

/**
 * Helper function for common admin role check and error handling.
 * This function will set the status and pass an error to the next middleware
 * if access is forbidden.
 * IMPORTANT: You must ensure your routes file applies a middleware like `protect`
 * before these controllers to ensure `req.user` is populated.
 */
const checkAdminAccess = (req, res, next) => {
  if (!req.user || !req.user.role || req.user.role !== "admin") {
    res.status(403);
    // Passing the error to the next middleware (your errorHandler)
    return next(new Error("Access forbidden. Admin role required."));
  }
  // If access is granted, proceed to the next middleware/controller
  next();
};

/**
 * @desc Get ticket counts by status for analytics
 * @route GET /api/analytics/tickets/status
 * @access Private/Admin
 */
const getTicketStatusAnalytics = async (req, res, next) => {
  // Ensure admin access before proceeding
  // The 'return' is crucial if next() is called with an error, to prevent further execution
  checkAdminAccess(req, res, () => {
    // This callback is executed if checkAdminAccess grants access (i.e., calls next())
    (async () => {
      // Self-invoking async function to use await
      try {
        const data = await Analytic.getTicketsByStatus();
        res.status(200).json(data);
      } catch (error) {
        console.error("Error fetching ticket status analytics:", error);
        next(error); // Pass error to global error handler
      }
    })();
  });
};

/**
 * @desc Get ticket counts by category for analytics
 * @route GET /api/analytics/tickets/category
 * @access Private/Admin
 */
const getTicketCategoryAnalytics = async (req, res, next) => {
  checkAdminAccess(req, res, () => {
    (async () => {
      try {
        const data = await Analytic.getTicketsByCategory();
        res.status(200).json(data);
      } catch (error) {
        console.error("Error fetching ticket category analytics:", error);
        next(error);
      }
    })();
  });
};

/**
 * @desc Get ticket counts by subCategory for a given main category for analytics
 * @route GET /api/analytics/tickets/subcategory/:category
 * @access Private/Admin
 */
const getTicketSubCategoryAnalytics = async (req, res, next) => {
  checkAdminAccess(req, res, () => {
    (async () => {
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
        next(error);
      }
    })();
  });
};

/**
 * @desc Get ticket counts by priority for analytics
 * @route GET /api/analytics/tickets/priority
 * @access Private/Admin
 */
const getTicketPriorityAnalytics = async (req, res, next) => {
  checkAdminAccess(req, res, () => {
    (async () => {
      try {
        const data = await Analytic.getTicketCountsByPriority();
        res.status(200).json(data);
      } catch (error) {
        console.error("Error fetching ticket priority analytics:", error);
        next(error);
      }
    })();
  });
};

/**
 * @desc Get ticket creation trend over time for analytics
 * @route GET /api/analytics/tickets/overtime?timeframe=30days
 * @access Private/Admin
 */
const getTicketsCreatedOverTimeAnalytics = async (req, res, next) => {
  checkAdminAccess(req, res, () => {
    (async () => {
      const { timeframe } = req.query; // e.g., '7days', '30days', 'year'

      try {
        const data = await Analytic.getTicketsCreatedOverTime(timeframe);
        res.status(200).json(data);
      } catch (error) {
        console.error(
          `Error fetching ticket creation over time (${timeframe}):`,
          error
        );
        next(error);
      }
    })();
  });
};

/**
 * @desc Get total user count for analytics
 * @route GET /api/analytics/users/total
 * @access Private/Admin
 */
const getTotalUserCountAnalytics = async (req, res, next) => {
  checkAdminAccess(req, res, () => {
    (async () => {
      try {
        const data = await Analytic.getTotalUserCount();
        res.status(200).json({ totalUsers: data }); // Wrap in an object for consistency
      } catch (error) {
        console.error("Error fetching total user count analytics:", error);
        next(error);
      }
    })();
  });
};

/**
 * @desc Get ticket counts by ServiceType for analytics
 * @route GET /api/analytics/tickets/servicetype
 * @access Private/Admin
 */
const getTicketServiceTypeAnalytics = async (req, res, next) => {
  checkAdminAccess(req, res, () => {
    (async () => {
      try {
        const data = await Analytic.getTicketsByServiceType();
        res.status(200).json(data);
      } catch (error) {
        console.error("Error fetching ticket ServiceType analytics:", error);
        next(error);
      }
    })();
  });
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
