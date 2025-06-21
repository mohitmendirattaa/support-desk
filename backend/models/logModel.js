// models/logModel.js

const sql = require("mssql");
const getSqlPool = require("../config/db").getSqlPool;

class Log {
  /**
   * @desc Creates a new log entry in the database.
   * @param {string} userId - The ID of the user performing the action (GUID format).
   * @param {string} action - The action performed (e.g., 'Login', 'Logout').
   * @returns {Promise<boolean>} True if the log entry was created successfully, false otherwise.
   */
  static async createLogEntry(userId, action) {
    if (!userId || typeof userId !== "string") {
      console.error("LogModel: Invalid User ID provided for log entry.");
      return false;
    }
    if (!action || typeof action !== "string") {
      console.error("LogModel: Invalid action provided for log entry.");
      return false;
    }

    try {
      const pool = getSqlPool();

      if (!pool.connected) {
        console.error("LogModel: SQL Pool is not connected.");
        return false;
      }

      const request = pool.request();

      // Only add parameters for UserID and Action
      request.input("userId", sql.UniqueIdentifier, userId);
      request.input("action", sql.NVarChar(50), action);

      const query = `
        INSERT INTO Logs (UserID, Action) -- Removed EntityType and EntityID from INSERT
        VALUES (@userId, @action);
      `;

      await request.query(query);
      return true;
    } catch (error) {
      console.error("LogModel: Database error creating log entry:", error);
      return false;
    }
  }

  /**
   * @desc Fetches all log entries from the database, ordered by timestamp descending.
   * @returns {Promise<Array<Object>>} A promise that resolves to an array of log objects.
   * @throws {Error} If there's a database error during retrieval.
   */
  static async findAllLogs() {
    try {
      const pool = getSqlPool();

      if (!pool.connected) {
        throw new Error("SQL Pool is not connected. Cannot retrieve logs.");
      }

      const request = pool.request();

      const query = `
        SELECT LogID, UserID, Action, Timestamp -- Removed EntityType, EntityID from SELECT
        FROM Logs
        ORDER BY Timestamp DESC;
      `;

      const result = await request.query(query);
      return result.recordset;
    } catch (error) {
      console.error("LogModel: Database error retrieving logs:", error);
      throw new Error("Could not retrieve logs from the database.");
    }
  }
}

module.exports = Log;
