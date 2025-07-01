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
            u.name AS userName,
            n.text,
            n.isStaff,
            n.createdAt,
            n.updatedAt
        FROM
            Notes AS n
        JOIN
            Users AS u ON n.userId = u.id
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

  create: async ({ ticketId, userId, text, isStaff }) => {
    const pool = getSqlPool();
    try {
      const request = pool.request();
      request.input("ticketId", sql.NVarChar(255), ticketId);
      request.input("userId", sql.UniqueIdentifier, userId);
      request.input("text", sql.NVarChar(sql.MAX), text);
      request.input("isStaff", sql.Bit, isStaff);

      // It's good practice to fetch userName inside the model, or pass it from controller
      // Your current approach of fetching it here is fine if you prefer.
      const userResult = await request.query(`
        SELECT name FROM Users WHERE id = '${userId}';
      `);
      const userName = userResult.recordset[0]?.name || "Unknown User";

      const insertRequest = pool.request();
      insertRequest.input("ticketId", sql.NVarChar(255), ticketId);
      insertRequest.input("userId", sql.UniqueIdentifier, userId);
      insertRequest.input("text", sql.NVarChar(sql.MAX), text);
      insertRequest.input("isStaff", sql.Bit, isStaff);
      insertRequest.input("userName", sql.NVarChar(255), userName);

      const result = await insertRequest.query(`
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

  findById: async (id) => {
    const pool = getSqlPool();
    try {
      const request = pool.request();
      request.input("id", sql.UniqueIdentifier, id);

      const result = await request.query(`
        SELECT
            n.id,
            n.ticketId,
            n.userId,
            u.name AS userName,
            n.text,
            n.isStaff,
            n.createdAt,
            n.updatedAt
        FROM
            Notes AS n
        JOIN
            Users AS u ON n.userId = u.id
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
