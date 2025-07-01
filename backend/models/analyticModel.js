const sql = require("mssql");
const getSqlPool = require("../config/db").getSqlPool; // Assuming this path is correct

const AnalyticModel = {

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
