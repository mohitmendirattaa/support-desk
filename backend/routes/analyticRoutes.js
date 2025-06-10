const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware"); // Import your authentication middleware
const { authorizeRoles } = require("../middleware/roleMiddleware"); // Import your role authorization middleware

// Import all the analytics controller functions
const {
  getTicketStatusAnalytics,
  getTicketCategoryAnalytics,
  getTicketSubCategoryAnalytics,
  getTicketPriorityAnalytics,
  getTicketsCreatedOverTimeAnalytics,
  getTotalUserCountAnalytics,
  getTicketServiceTypeAnalytics,
} = require("../controllers/analyticController"); // Ensure this path is correct

// All analytics routes will be protected and require the 'admin' role
router.use(protect);
router.use(authorizeRoles(["admin"]));

/**
 * @desc Admin: Get ticket counts by status for analytics
 * @route GET /api/analytics/tickets/status
 * @access Private/Admin
 */
router.get("/tickets/status", getTicketStatusAnalytics);

/**
 * @desc Admin: Get ticket counts by category for analytics
 * @route GET /api/analytics/tickets/category
 * @access Private/Admin
 */
router.get("/tickets/category", getTicketCategoryAnalytics);

/**
 * @desc Admin: Get ticket counts by subCategory for a given main category for analytics
 * @route GET /api/analytics/tickets/subcategory/:category
 * @access Private/Admin
 */
router.get("/tickets/subcategory/:category", getTicketSubCategoryAnalytics);

/**
 * @desc Admin: Get ticket counts by priority for analytics
 * @route GET /api/analytics/tickets/priority
 * @access Private/Admin
 */
router.get("/tickets/priority", getTicketPriorityAnalytics);

/**
 * @desc Admin: Get ticket creation trend over time for analytics
 * @route GET /api/analytics/tickets/overtime
 * @queryParam timeframe - '7days', '30days', '90days', 'year'
 * @access Private/Admin
 */
router.get("/tickets/overtime", getTicketsCreatedOverTimeAnalytics);

/**
 * @desc Admin: Get total user count for analytics
 * @route GET /api/analytics/users/total
 * @access Private/Admin
 */
router.get("/users/total", getTotalUserCountAnalytics);

/**
 * @desc Admin: Get ticket counts by ServiceType for analytics
 * @route GET /api/analytics/tickets/servicetype
 * @access Private/Admin
 */
router.get("/tickets/servicetype", getTicketServiceTypeAnalytics);

module.exports = router;
