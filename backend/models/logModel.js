const sql = require("mssql");
const getSqlPool = require("../config/db").getSqlPool; // Assumes your db config provides a pool

class Log {
  /**
   * Creates a new log entry in the database.
   * @param {string} userId - The unique identifier of the user performing the action (uniqueidentifier in DB).
   * @param {string} action - A descriptive string of the action performed (nvarchar(50) in DB).
   * @returns {Promise<boolean>} True if the log entry was created successfully, false otherwise.
   */
  static async createLogEntry(userId, action) {
    // Basic validation for input parameters
    if (!userId || typeof userId !== "string") {
      console.error("LogModel: Invalid User ID provided for log entry.");
      return false;
    }
    if (!action || typeof action !== "string") {
      console.error("LogModel: Invalid action provided for log entry.");
      return false;
    }

    try {
      const pool = getSqlPool(); // Get the connected SQL Server pool

      // Ensure the database connection pool is active
      if (!pool.connected) {
        console.error(
          "LogModel: SQL Pool is not connected. Cannot create log entry."
        );
        return false;
      }

      const request = pool.request(); // Create a new request object

      // Input parameters for the SQL query, preventing SQL injection
      request.input("userId", sql.UniqueIdentifier, userId); // UserID is uniqueidentifier
      request.input("action", sql.NVarChar(50), action); // Action is nvarchar(50)

      const query = `
        INSERT INTO Logs (UserID, Action)
        VALUES (@userId, @action);
      `;

      await request.query(query); // Execute the INSERT query
      return true; // Indicate successful creation
    } catch (error) {
      console.error("LogModel: Database error creating log entry:", error);
      return false; // Indicate failure
    }
  }

  /**
   * Retrieves log entries from the database, with optional filtering by date range and User ID.
   * @param {object} [filters={}] - An object containing filtering criteria.
   * @param {string} [filters.from] - Start date for filtering (YYYY-MM-DD format).
   * @param {string} [filters.to] - End date for filtering (YYYY-MM-DD format).
   * @param {string} [filters.userId] - User ID to filter logs by.
   * @returns {Promise<Array>} An array of log records.
   * @throws {Error} If the SQL pool is not connected or a database error occurs.
   */
  static async findAllLogs(filters = {}) {
    try {
      const pool = getSqlPool(); // Get the connected SQL Server pool

      // Ensure the database connection pool is active
      if (!pool.connected) {
        throw new Error("SQL Pool is not connected. Cannot retrieve logs.");
      }

      const request = pool.request(); // Create a new request object
      let whereClause = ""; // Initialize an empty WHERE clause
      const conditions = []; // Array to hold individual WHERE conditions

      // Build WHERE conditions based on provided filters
      if (filters.from) {
        // Log timestamps greater than or equal to the 'from' date
        conditions.push(`Timestamp >= @fromDate`);
        request.input("fromDate", sql.DateTime, new Date(filters.from));
      }

      if (filters.to) {
        // Log timestamps less than or equal to the 'to' date (end of day)
        conditions.push(`Timestamp <= @toDate`);
        // Set the 'to' date to the very end of the day to include all logs on that day
        const toDate = new Date(filters.to);
        toDate.setHours(23, 59, 59, 999);
        request.input("toDate", sql.DateTime, toDate);
      }

      if (filters.userId) {
        // Filter by specific UserID. UserID is uniqueidentifier in your DB.
        conditions.push(`UserID = @userId`);
        request.input("userId", sql.UniqueIdentifier, filters.userId);
      }

      // If there are conditions, join them with 'AND' and form the WHERE clause
      if (conditions.length > 0) {
        whereClause = ` WHERE ${conditions.join(" AND ")}`;
      }

      const query = `
        SELECT LogID, UserID, Action, Timestamp
        FROM Logs
        ${whereClause} -- Dynamically insert the WHERE clause
        ORDER BY Timestamp DESC; -- Order by most recent logs first
      `;

      const result = await request.query(query); // Execute the query
      return result.recordset; // Return the retrieved records
    } catch (error) {
      console.error("LogModel: Database error retrieving logs:", error);
      throw new Error("Could not retrieve logs from the database.");
    }
  }
}

module.exports = Log;
