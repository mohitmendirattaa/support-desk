const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const {
  loginUser,
  registerUser,
  getMe,
  getAllUsers,
  getSingleUser,
  updateUserStatus,
  updateUser,
} = require("../controllers/userController");

router.post("/", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.get("/all", protect, authorizeRoles(["admin"]), getAllUsers);
router.get("/:id", protect, authorizeRoles(["admin"]), getSingleUser);
router.put("/:id/status", protect, authorizeRoles(["admin"]), updateUserStatus);
router.put("/:id", protect, authorizeRoles(["admin"]), updateUser);


module.exports = router;
