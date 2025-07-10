const Log = require("../models/logModel");
const asyncHandler = require("express-async-handler"); // Import asyncHandler for error handling

const getLogs = asyncHandler(async (req, res, next) => {
  // Ensure only administrators can access logs
  if (!req.user || req.user.role !== "admin") {
    res.status(403); // Forbidden
    return next(
      new Error("Not authorized. Admin privileges required to view logs.")
    );
  }

  try {
    // Extract filter parameters from the URL query string
    const { from, to, userId } = req.query;

    // Construct a filters object to pass to the model.
    // Only include parameters that are actually provided in the request.
    const filters = {};
    if (from) filters.from = from;
    if (to) filters.to = to;
    if (userId) filters.userId = userId;

    // Fetch logs from the database, applying any specified filters
    const logs = await Log.findAllLogs(filters);

    // Send the retrieved logs as a successful response
    res.status(200).json(logs);
  } catch (error) {
    // Log the detailed error on the server side for debugging
    console.error("Error retrieving logs in logController:", error);
    res.status(500); // Internal Server Error
    return next(new Error("Could not retrieve logs due to a server error."));
  }
});

module.exports = { getLogs };
