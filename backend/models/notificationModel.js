const sql = require("mssql");
console.log("DEBUG: NotificationModel.js file has been loaded!");
const getSqlPool = require("../config/db").getSqlPool;

const NotificationModel = {
  create: async ({
    userId,
    ticketId,
    message,
    notificationType,
    isSeen = false,
  }) => {
    const pool = getSqlPool();
    try {
      const request = pool.request();
      request.input("userId", sql.UniqueIdentifier, userId);
      request.input("ticketId", sql.NVarChar(255), ticketId);
      request.input("message", sql.NVarChar(sql.MAX), message);
      request.input("notificationType", sql.NVarChar(50), notificationType);
      request.input("isSeen", sql.Bit, isSeen);
      const sqlQuery = `
        INSERT INTO Notifications (userId, ticketId, message, notificationType, isSeen, createdAt, updatedAt)
        OUTPUT INSERTED.id, INSERTED.userId, INSERTED.ticketId, INSERTED.message, INSERTED.notificationType, INSERTED.isSeen, INSERTED.createdAt, INSERTED.updatedAt
        VALUES (@userId, @ticketId, @message, @notificationType, @isSeen, GETUTCDATE(), GETUTCDATE());
      `;
      const result = await request.query(sqlQuery);
      if (result.recordset && result.recordset.length > 0) {
        return result.recordset[0];
      }
      return null;
    } catch (err) {
      console.error("Error in NotificationModel.create:", err.message);
      throw new Error(`Error creating notification: ${err.message}`);
    }
  },

  getAdminDashboardNotifications: async (adminUserId) => {
    const pool = getSqlPool();
    try {
      const request = pool.request();
      request.input("adminUserId", sql.UniqueIdentifier, adminUserId);
      request.input("newTicketType", sql.NVarChar(50), "newTicket");
      const result = await request.query(`
        SELECT
          n.id, n.userId, n.message, n.notificationType, n.isSeen, n.createdAt, n.updatedAt,
          t.id AS ticket_db_id, t.description AS ticket_description, t.status AS ticket_status,
          u.name AS user_name, u.email AS user_email
        FROM Notifications n
        JOIN Tickets t ON n.ticketId = t.id 
        JOIN Users u ON t.userId = u.id
        WHERE n.userId = @adminUserId OR n.notificationType = @newTicketType
        ORDER BY n.createdAt DESC;
      `);
      return result.recordset.map((record) => ({
        id: record.id,
        userId: record.userId,
        message: record.message,
        notificationType: record.notificationType,
        isSeen: record.isSeen,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        ticketId: record.ticket_db_id,
        ticketDetails: {
          displayId: record.ticket_db_id,
          description: record.ticket_description,
          status: record.ticket_status,
        },
        ticketCreatedBy: {
          name: record.user_name,
          email: record.user_email,
        },
      }));
    } catch (err) {
      console.error(
        "Error in NotificationModel.getAdminDashboardNotifications:",
        err.message
      );
      throw new Error(
        `Error fetching admin dashboard notifications: ${err.message}`
      );
    }
  },

  findByUserId: async (userId) => {
    const pool = getSqlPool();
    try {
      const request = pool.request();
      request.input("userId", sql.UniqueIdentifier, userId);
      const result = await request.query(`
        SELECT
          n.id, n.userId, n.message, n.notificationType, n.isSeen, n.createdAt, n.updatedAt,
          t.id AS ticket_db_id, t.description AS ticket_description, t.status AS ticket_status,
          u.name AS user_name, u.email AS user_email
        FROM Notifications n
        JOIN Tickets t ON n.ticketId = t.id 
        JOIN Users u ON t.userId = u.id
        WHERE n.userId = @userId
        ORDER BY n.createdAt DESC;
      `);
      return result.recordset.map((record) => ({
        id: record.id,
        userId: record.userId,
        message: record.message,
        notificationType: record.notificationType,
        isSeen: record.isSeen,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        ticketId: record.ticket_db_id,
        ticketDetails: {
          displayId: record.ticket_db_id,
          description: record.ticket_description,
          status: record.ticket_status,
        },
        ticketCreatedBy: {
          name: record.user_name,
          email: record.user_email,
        },
      }));
    } catch (err) {
      console.error("Error in NotificationModel.findByUserId:", err.message);
      throw new Error(`Error finding notifications by user ID: ${err.message}`);
    }
  },

  markAsSeen: async (notificationId) => {
    const pool = getSqlPool();
    try {
      const request = pool.request();
      request.input("id", sql.UniqueIdentifier, notificationId);
      const sqlQuery = `
        UPDATE Notifications
        SET isSeen = 1, updatedAt = GETUTCDATE()
        OUTPUT INSERTED.id, INSERTED.isSeen, INSERTED.updatedAt
        WHERE id = @id;
      `;
      const result = await request.query(sqlQuery);
      if (result.recordset && result.recordset.length > 0) {
        return result.recordset[0];
      }
      return null;
    } catch (err) {
      console.error("Error in NotificationModel.markAsSeen:", err.message);
      throw new Error(`Error marking notification as seen: ${err.message}`);
    }
  },

  markAllAsSeenByUserId: async (userId) => {
    const pool = getSqlPool();
    try {
      const request = pool.request();
      request.input("userId", sql.UniqueIdentifier, userId);
      request.input("newTicketType", sql.NVarChar(50), "newTicket");
      const sqlQuery = `
        UPDATE Notifications
        SET isSeen = 1, updatedAt = GETUTCDATE()
        WHERE (userId = @userId OR notificationType = @newTicketType) AND isSeen = 0;
      `;
      const result = await request.query(sqlQuery);
      return result.rowsAffected[0] > 0;
    } catch (err) {
      console.error(
        "Error in NotificationModel.markAllAsSeenByUserId:",
        err.message
      );
      throw new Error(
        `Error marking all notifications as seen: ${err.message}`
      );
    }
  },

  getUnseenCountByUserId: async (userId) => {
    const pool = getSqlPool();
    try {
      const request = pool.request();
      request.input("userId", sql.UniqueIdentifier, userId);
      request.input("newTicketType", sql.NVarChar(50), "newTicket");
      const result = await request.query(`
        SELECT COUNT(*) AS unseenCount
        FROM Notifications
        WHERE (userId = @userId OR notificationType = @newTicketType) AND isSeen = 0;
      `);
      return result.recordset[0].unseenCount;
    } catch (err) {
      console.error(
        "Error in NotificationModel.getUnseenCountByUserId:",
        err.message
      );
      throw new Error(
        `Error getting unseen notification count: ${err.message}`
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
          n.id, n.userId, n.ticketId, n.message, n.notificationType, n.isSeen, n.createdAt, n.updatedAt
        FROM Notifications n
        WHERE n.id = @id;
      `);
      return result.recordset[0] || null;
    } catch (err) {
      console.error("Error in NotificationModel.findById:", err.message);
      throw new Error(
        `Error finding notification by ID: ${err.message}. Input ID was: '${id}'`
      );
    }
  },

  delete: async (notificationId, userId) => {
    const pool = getSqlPool();
    try {
      const request = pool.request();
      request.input("notificationId", sql.UniqueIdentifier, notificationId);
      request.input("userId", sql.UniqueIdentifier, userId);
      request.input("newTicketType", sql.NVarChar(50), "newTicket");
      const sqlQuery = `
        DELETE FROM Notifications
        WHERE id = @notificationId AND (userId = @userId OR notificationType = @newTicketType);
      `;
      const result = await request.query(sqlQuery);
      return result.rowsAffected[0];
    } catch (err) {
      console.error("Error in NotificationModel.delete:", err.message);
      throw new Error(`Error deleting notification: ${err.message}`);
    }
  },

  deleteAllByUserId: async (userId) => {
    const pool = getSqlPool();
    try {
      const request = pool.request();
      request.input("userId", sql.UniqueIdentifier, userId);
      request.input("newTicketType", sql.NVarChar(50), "newTicket");
      const sqlQuery = `
        DELETE FROM Notifications
        WHERE userId = @userId OR notificationType = @newTicketType;
      `;
      const result = await request.query(sqlQuery);
      return result.rowsAffected[0];
    } catch (err) {
      console.error(
        "Error in NotificationModel.deleteAllByUserId:",
        err.message
      );
      throw new Error(`Error deleting all notifications: ${err.message}`);
    }
  },
};

module.exports = NotificationModel;
