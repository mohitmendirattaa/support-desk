const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const {
  getTicketStatusAnalytics,
  getTicketCategoryAnalytics,
  getTicketSubCategoryAnalytics,
  getTicketPriorityAnalytics,
  getTicketsCreatedOverTimeAnalytics,
  getTotalUserCountAnalytics,
  getTicketServiceTypeAnalytics,
} = require("../controllers/analyticController");

router.use(protect);
router.use(authorizeRoles(["admin"]));

router.get("/tickets/status", getTicketStatusAnalytics);

router.get("/tickets/category", getTicketCategoryAnalytics);

router.get("/tickets/subcategory/:category", getTicketSubCategoryAnalytics);

router.get("/tickets/priority", getTicketPriorityAnalytics);

router.get("/tickets/overtime", getTicketsCreatedOverTimeAnalytics);

router.get("/users/total", getTotalUserCountAnalytics);

router.get("/tickets/servicetype", getTicketServiceTypeAnalytics);

module.exports = router;
