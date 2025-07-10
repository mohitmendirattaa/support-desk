const sql = require("mssql");
const getSqlPool = require("../config/db").getSqlPool;

const NoteModel = {
  findByTicketId: async (ticketId) => {
    const pool = getSqlPool();
    try {
      const request = pool.request();
      request.input("ticketId", sql.NVarChar(255), ticketId);

      const result = await request.query(`
        SELECT
            n.id,
            n.ticketId,
            n.userId,
            n.userName,  -- Select userName directly from Notes table for historical accuracy
            n.text,
            n.isStaff,
            n.createdAt,
            n.updatedAt
        FROM
            Notes AS n
        WHERE
            n.ticketId = @ticketId
        ORDER BY
            n.createdAt DESC;
      `);

      return result.recordset;
    } catch (err) {
      throw new Error(
        `Error fetching notes for ticket ${ticketId}: ${err.message}`
      );
    }
  },

  // --- START OF MODIFICATION ---
  create: async ({ ticketId, userId, text, isStaff, userName }) => {
    // <-- Add userName to parameters
    const pool = getSqlPool();
    try {
      // Remove the userName lookup here, as it's passed from the controller
      // const userResult = await request.query(`
      //   SELECT name FROM Users WHERE id = '${userId}';
      // `);
      // const userName = userResult.recordset[0]?.name || "Unknown User"; // This line is no longer needed

      const request = pool.request(); // Use 'request' or 'insertRequest' consistently
      request.input("ticketId", sql.NVarChar(255), ticketId);
      request.input("userId", sql.UniqueIdentifier, userId);
      request.input("text", sql.NVarChar(sql.MAX), text);
      request.input("isStaff", sql.Bit, isStaff);
      request.input("userName", sql.NVarChar(255), userName); // Use the userName passed in

      const result = await request.query(`
        INSERT INTO Notes (ticketId, userId, text, isStaff, userName)
        OUTPUT INSERTED.id, INSERTED.ticketId, INSERTED.userId, INSERTED.text, INSERTED.isStaff, INSERTED.createdAt, INSERTED.updatedAt, INSERTED.userName
        VALUES (@ticketId, @userId, @text, @isStaff, @userName);
      `);

      return result.recordset[0];
    } catch (err) {
      throw new Error(
        `Error creating note for ticket ${ticketId}: ${err.message}`
      );
    }
  },
  // --- END OF MODIFICATION ---

  findById: async (id) => {
    const pool = getSqlPool();
    try {
      const request = pool.request();
      request.input("id", sql.Int, id); // Assuming 'id' column in Notes is INT, not UNIQUEIDENTIFIER

      const result = await request.query(`
        SELECT
            n.id,
            n.ticketId,
            n.userId,
            n.userName,  -- Select userName directly from Notes table
            n.text,
            n.isStaff,
            n.createdAt,
            n.updatedAt
        FROM
            Notes AS n
        WHERE
            n.id = @id;
      `);

      return result.recordset[0] || null;
    } catch (err) {
      throw new Error(`Error finding note by ID ${id}: ${err.message}`);
    }
  },
};

module.exports = NoteModel;
