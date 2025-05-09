const express = require("express");
const router = express.Router({
  mergeParams: true,
});
const { getNotes, addNote } = require("../controllers/noteController");
const protect = require("../middleware/authMiddleware");

router.get("/", protect, getNotes);

router.post("/", protect, addNote);

module.exports = router;
