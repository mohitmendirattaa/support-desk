const sql = require("mssql");
const getSqlPool = require("../config/db").getSqlPool;

const NoteModel = {
  /**
   * Get all notes for a specific ticket.
   * @param {string} ticketId - The ID of the ticket.
   * @returns {Promise<Array>} - An array of note objects.
   * @throws {Error} If there's an error fetching notes.
   */
  findByTicketId: async (ticketId) => {
    const pool = getSqlPool();
    try {
      const request = pool.request();
      request.input("ticketId", sql.NVarChar(255), ticketId);

      // IMPORTANT: Joining with the Users table to get the userName
      // Assuming your Users table has 'id' and 'name' columns
      const result = await request.query(`
        SELECT
            n.id,
            n.ticketId,
            n.userId,
            u.name AS userName, -- Select the user's name from the Users table
            n.text,
            n.isStaff,
            n.createdAt,
            n.updatedAt
        FROM
            Notes AS n
        JOIN
            Users AS u ON n.userId = u.id -- Join Notes with Users on userId
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

  /**
   * Create a new note for a specific ticket.
   * @param {string} ticketId - The ID of the ticket the note belongs to.
   * @param {string} userId - The ID of the user creating the note.
   * @param {string} text - The content of the note.
   * @param {boolean} isStaff - True if the note is from staff, false otherwise.
   * @returns {Promise<Object>} - The newly created note object.
   * @throws {Error} If there's an error creating the note.
   */
  create: async ({ ticketId, userId, text, isStaff }) => {
    const pool = getSqlPool();
    try {
      const request = pool.request();
      request.input("ticketId", sql.NVarChar(255), ticketId);
      request.input("userId", sql.UniqueIdentifier, userId);
      request.input("text", sql.NVarChar(sql.MAX), text);
      request.input("isStaff", sql.Bit, isStaff);

      // To get the userName for the OUTPUT clause, we need to fetch it first.
      // Alternatively, if userName is passed to this function, you can use it directly.
      // For now, let's assume we need to fetch it to ensure consistency.
      const userResult = await request.query(`
        SELECT name FROM Users WHERE id = '${userId}';
      `);
      const userName = userResult.recordset[0]?.name || "Unknown User";

      // Re-initialize request or use a new one to avoid conflicts if needed,
      // though typically mssql allows sequential queries on the same request object.
      const insertRequest = pool.request();
      insertRequest.input("ticketId", sql.NVarChar(255), ticketId);
      insertRequest.input("userId", sql.UniqueIdentifier, userId);
      insertRequest.input("text", sql.NVarChar(sql.MAX), text);
      insertRequest.input("isStaff", sql.Bit, isStaff);
      insertRequest.input("userName", sql.NVarChar(255), userName); // Input for userName

      const result = await insertRequest.query(`
        INSERT INTO Notes (ticketId, userId, text, isStaff, userName) -- Added userName column here
        OUTPUT INSERTED.id, INSERTED.ticketId, INSERTED.userId, INSERTED.text, INSERTED.isStaff, INSERTED.createdAt, INSERTED.updatedAt, INSERTED.userName -- Added userName output
        VALUES (@ticketId, @userId, @text, @isStaff, @userName); -- Added @userName value here
      `);

      return result.recordset[0]; // Return the newly created note
    } catch (err) {
      throw new Error(
        `Error creating note for ticket ${ticketId}: ${err.message}`
      );
    }
  },

  /**
   * Find a note by its ID.
   * (Optional, but good for specific note operations if needed in the future)
   * @param {string} id - The ID of the note.
   * @returns {Promise<Object|null>} - The note object if found, otherwise null.
   * @throws {Error} If there's an error finding the note.
   */
  findById: async (id) => {
    const pool = getSqlPool();
    try {
      const request = pool.request();
      request.input("id", sql.UniqueIdentifier, id); // Assuming note IDs are GUIDs

      // Joining with Users table to get userName
      const result = await request.query(`
        SELECT
            n.id,
            n.ticketId,
            n.userId,
            u.name AS userName, -- Select the user's name from the Users table
            n.text,
            n.isStaff,
            n.createdAt,
            n.updatedAt
        FROM
            Notes AS n
        JOIN
            Users AS u ON n.userId = u.id -- Join Notes with Users on userId
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
