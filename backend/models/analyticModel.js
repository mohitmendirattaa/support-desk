const sql = require("mssql");
const getSqlPool = require("../config/db").getSqlPool; // Assuming this path is correct

const AnalyticModel = {
  /**
   * Retrieves the count of tickets by their status.
   * @returns {Promise<Array<{name: string, count: number}>>} An array of objects, e.g., [{name: 'new', count: 5}, {name: 'open', count: 10}]
   */
  getTicketsByStatus: async () => {
    const pool = getSqlPool();
    try {
      const result = await pool.request().query(`
        SELECT
            status AS name,
            COUNT(id) AS count
        FROM
            Tickets
        GROUP BY
            status
        ORDER BY
            count DESC;
      `);
      return result.recordset;
    } catch (err) {
      throw new Error(
        `Error getting tickets by status for analytics: ${err.message}`
      );
    }
  },

  /**
   * Retrieves the count of tickets by their category.
   * @returns {Promise<Array<{name: string, count: number}>>} An array of objects, e.g., [{name: 'SAP', count: 15}, {name: 'Digital', count: 8}]
   */
  getTicketsByCategory: async () => {
    const pool = getSqlPool();
    try {
      const result = await pool.request().query(`
        SELECT
            category AS name,
            COUNT(id) AS count
        FROM
            Tickets
        GROUP BY
            category
        ORDER BY
            count DESC;
      `);
      return result.recordset;
    } catch (err) {
      throw new Error(
        `Error getting tickets by category for analytics: ${err.message}`
      );
    }
  },

  /**
   * Retrieves the count of tickets by subCategory for a given main category.
   * @param {string} category - The main category (e.g., 'SAP', 'Digital').
   * @returns {Promise<Array<{name: string, count: number}>>} An array of objects, e.g., [{name: 'MM', count: 5}, {name: 'SD', count: 3}]
   */
  getTicketsBySubCategory: async (category) => {
    const pool = getSqlPool();
    try {
      const request = pool.request();
      request.input("category", sql.NVarChar(50), category);
      const result = await request.query(`
        SELECT
            subCategory AS name,
            COUNT(id) AS count
        FROM
            Tickets
        WHERE
            category = @category
        GROUP BY
            subCategory
        ORDER BY
            count DESC;
      `);
      return result.recordset;
    } catch (err) {
      throw new Error(
        `Error getting tickets by subCategory for analytics: ${err.message}`
      );
    }
  },

  /**
   * Retrieves the count of tickets by their priority.
   * @returns {Promise<Array<{name: string, count: number}>>} An array of objects, e.g., [{name: 'High', count: 7}, {name: 'Medium', count: 12}]
   */
  getTicketCountsByPriority: async () => {
    const pool = getSqlPool();
    try {
      const result = await pool.request().query(`
        SELECT
            priority AS name,
            COUNT(id) AS count
        FROM
            Tickets
        GROUP BY
            priority
        ORDER BY
            count DESC;
      `);
      return result.recordset;
    } catch (err) {
      throw new Error(
        `Error getting ticket counts by priority for analytics: ${err.message}`
      );
    }
  },

  /**
   * Retrieves the count of tickets created over a specified timeframe (e.g., last 7 days, last 30 days).
   * @param {string} timeframe - '7days', '30days', '90days', 'year'.
   * @returns {Promise<Array<{date: string, count: number}>>} An array of objects, e.g., [{date: '2023-10-01', count: 5}]
   * Note: This is a more complex query and might need adjustment based on your exact SQL Server version and date functions.
   * This example aggregates daily counts.
   */
  getTicketsCreatedOverTime: async (timeframe = "30days") => {
    const pool = getSqlPool();
    let dateFilter = "";
    switch (timeframe) {
      case "7days":
        dateFilter = "DATEADD(day, -7, GETUTCDATE())";
        break;
      case "30days":
        dateFilter = "DATEADD(day, -30, GETUTCDATE())";
        break;
      case "90days":
        dateFilter = "DATEADD(day, -90, GETUTCDATE())";
        break;
      case "year":
        dateFilter = "DATEADD(year, -1, GETUTCDATE())";
        break;
      default:
        dateFilter = "DATEADD(day, -30, GETUTCDATE())"; // Default to 30 days
        break;
    }

    try {
      const request = pool.request();
      const result = await request.query(`
            SELECT
                CONVERT(VARCHAR(10), createdAt, 120) AS date,
                COUNT(id) AS count
            FROM
                Tickets
            WHERE
                createdAt >= ${dateFilter}
            GROUP BY
                CONVERT(VARCHAR(10), createdAt, 120)
            ORDER BY
                date ASC;
        `);
      return result.recordset;
    } catch (err) {
      throw new Error(
        `Error getting tickets created over time (${timeframe}) for analytics: ${err.message}`
      );
    }
  },

  /**
   * Retrieves the total count of users in the system.
   * This assumes you have a 'Users' table.
   * @returns {Promise<number>} Total user count.
   */
  getTotalUserCount: async () => {
    const pool = getSqlPool();
    try {
      const result = await pool.request().query(`
        SELECT COUNT(id) AS totalUsers FROM Users;
      `);
      return result.recordset[0].totalUsers;
    } catch (err) {
      throw new Error(
        `Error getting total user count for analytics: ${err.message}`
      );
    }
  },

  /**
   * Retrieves the count of tickets based on their ServiceType.
   * @returns {Promise<Array<{name: string, count: number}>>} An array of objects, e.g., [{name: 'Installation', count: 10}]
   */
  getTicketsByServiceType: async () => {
    const pool = getSqlPool();
    try {
      const result = await pool.request().query(`
        SELECT
            ServiceType AS name,
            COUNT(id) AS count
        FROM
            Tickets
        GROUP BY
            ServiceType
        ORDER BY
            count DESC;
      `);
      return result.recordset;
    } catch (err) {
      throw new Error(
        `Error getting tickets by ServiceType for analytics: ${err.message}`
      );
    }
  },
};

module.exports = AnalyticModel;
