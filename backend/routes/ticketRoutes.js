const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const noteRoutes = require("./noteRoutes");

const {
  getTickets,
  createTicket,
  getTicket,
  updateTicket,
  deleteTicket,
  getAllTicketsForAdmin,
  getSingleTicketForAdmin,
  upload,
} = require("../controllers/ticketController");

router.get("/", protect, getTickets);
router.post("/", protect, upload.single("file"), createTicket);
router.get("/:id", protect, getTicket);
router.put("/:id", protect, upload.single("file"), updateTicket);
router.delete("/:id", protect, authorizeRoles(["admin"]), deleteTicket);

router.get(
  "/admin/allTickets",
  protect,
  authorizeRoles(["admin"]),
  getAllTicketsForAdmin
);

router.get(
  "/admin/:id",
  protect,
  authorizeRoles(["admin"]),
  getSingleTicketForAdmin
);

router.use("/:ticketId/notes", noteRoutes);

module.exports = router;
