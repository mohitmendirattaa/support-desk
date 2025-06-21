// controllers/logController.js
const Log = require("../models/logModel");

const getLogs = async (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403);
    return next(
      new Error("Not authorized. Admin privileges required to view logs.")
    );
  }
  try {
    const logs = await Log.findAllLogs();
    res.status(200).json(logs);
  } catch (error) {
    console.error("Log Controller - Get Logs Error:", error);
    res.status(500);
    return next(new Error("Could not retrieve logs due to a server error."));
  }
};
module.exports = { getLogs };
