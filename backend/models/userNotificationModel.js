// backend/models/userNotificationModel.js
const sql = require("mssql");
const getSqlPool = require("../config/db").getSqlPool;

const UserNotificationModel = {
  create: async ({
    userId,
    ticketId,
    message,
    notificationType,
    isSeen = false,
  }) => {
    console.log("DEBUG_MODEL: UserNotificationModel.create called."); // DEBUG LOG 6
    const pool = getSqlPool();
    try {
      const request = pool.request();
      request.input("userId", sql.UniqueIdentifier, userId);
      request.input("ticketId", ticketId ? sql.NVarChar(255) : null, ticketId);
      request.input("message", sql.NVarChar(sql.MAX), message);
      request.input("notificationType", sql.NVarChar(50), notificationType);
      request.input("isSeen", sql.Bit, isSeen);

      const sqlQuery = `
        INSERT INTO UserNotifications (UserId, TicketId, Message, NotificationType, IsSeen, CreatedAt, UpdatedAt)
        OUTPUT INSERTED.UserNotificationId, INSERTED.UserId, INSERTED.TicketId, INSERTED.Message, INSERTED.NotificationType, INSERTED.IsSeen, INSERTED.CreatedAt, INSERTED.UpdatedAt
        VALUES (@userId, @ticketId, @message, @notificationType, @isSeen, GETUTCDATE(), GETUTCDATE());
      `;
      console.log(
        "DEBUG_MODEL: Executing SQL query for UserNotification.create:",
        sqlQuery
      ); // DEBUG LOG 7
      const result = await request.query(sqlQuery);
      if (result.recordset && result.recordset.length > 0) {
        console.log(
          "DEBUG_MODEL: UserNotification created in DB:",
          result.recordset[0]
        ); // DEBUG LOG 8
        const newNotification = result.recordset[0];
        return {
          id: newNotification.UserNotificationId,
          userId: newNotification.UserId,
          ticketId: newNotification.TicketId,
          message: newNotification.Message,
          notificationType: newNotification.NotificationType,
          isSeen: newNotification.IsSeen,
          createdAt: newNotification.CreatedAt,
          updatedAt: newNotification.UpdatedAt,
        };
      }
      console.log(
        "DEBUG_MODEL: UserNotification create returned null (no recordset)."
      ); // DEBUG LOG 9
      return null;
    } catch (err) {
      console.error(
        "ERROR_MODEL: Error in UserNotificationModel.create:",
        err.message,
        err.stack
      ); // DEBUG LOG 10
      throw new Error(`Error creating user notification: ${err.message}`);
    }
  },

  // ... (rest of the UserNotificationModel code remains the same)
  /**
   * Fetches all notifications for a specific user from the UserNotifications table.
   * @param {string} userId - The ID of the user whose notifications to fetch.
   * @returns {Promise<Array<object>>} An array of user notification objects.
   */
  findByUserId: async (userId) => {
    const pool = getSqlPool();
    try {
      const request = pool.request();
      request.input("userId", sql.UniqueIdentifier, userId);
      const result = await request.query(`
        SELECT
          n.UserNotificationId, n.UserId, n.Message, n.NotificationType, n.IsSeen, n.CreatedAt, n.UpdatedAt,
          t.id AS Ticket_db_id, t.description AS Ticket_description, t.status AS Ticket_status
        FROM UserNotifications n
        LEFT JOIN Tickets t ON n.TicketId = t.id
        WHERE n.UserId = @userId
        ORDER BY n.CreatedAt DESC;
      `);
      return result.recordset.map((record) => ({
        id: record.UserNotificationId,
        userId: record.UserId,
        message: record.Message,
        notificationType: record.NotificationType,
        isSeen: record.IsSeen,
        createdAt: record.CreatedAt,
        updatedAt: record.UpdatedAt,
        ticketId: record.Ticket_db_id,
        ticketDetails: {
          description: record.Ticket_description,
          status: record.Ticket_status,
        },
      }));
    } catch (err) {
      console.error(
        "Error in UserNotificationModel.findByUserId:",
        err.message
      );
      throw new Error(
        `Error finding user notifications by user ID: ${err.message}`
      );
    }
  },

  markAsSeen: async (notificationId) => {
    const pool = getSqlPool();
    try {
      const request = pool.request();
      request.input("userNotificationId", sql.Int, notificationId);
      const sqlQuery = `
        UPDATE UserNotifications
        SET IsSeen = 1, UpdatedAt = GETUTCDATE()
        OUTPUT INSERTED.UserNotificationId, INSERTED.IsSeen, INSERTED.UpdatedAt
        WHERE UserNotificationId = @userNotificationId;
      `;
      const result = await request.query(sqlQuery);
      if (result.recordset && result.recordset.length > 0) {
        const updated = result.recordset[0];
        return {
          id: updated.UserNotificationId,
          isSeen: updated.IsSeen,
          updatedAt: updated.UpdatedAt,
        };
      }
      return null;
    } catch (err) {
      console.error("Error in UserNotificationModel.markAsSeen:", err.message);
      throw new Error(
        `Error marking user notification as seen: ${err.message}`
      );
    }
  },

  markAllAsSeenByUserId: async (userId) => {
    const pool = getSqlPool();
    try {
      const request = pool.request();
      request.input("userId", sql.UniqueIdentifier, userId);
      const sqlQuery = `
        UPDATE UserNotifications
        SET IsSeen = 1, UpdatedAt = GETUTCDATE()
        WHERE UserId = @userId AND IsSeen = 0;
      `;
      const result = await request.query(sqlQuery);
      return result.rowsAffected[0] > 0;
    } catch (err) {
      console.error(
        "Error in UserNotificationModel.markAllAsSeenByUserId:",
        err.message
      );
      throw new Error(
        `Error marking all user notifications as seen: ${err.message}`
      );
    }
  },

  getUnseenCountByUserId: async (userId) => {
    const pool = getSqlPool();
    try {
      const request = pool.request();
      request.input("userId", sql.UniqueIdentifier, userId);
      const result = await request.query(`
        SELECT COUNT(*) AS unseenCount
        FROM UserNotifications
        WHERE UserId = @userId AND IsSeen = 0;
      `);
      return result.recordset[0].unseenCount;
    } catch (err) {
      console.error(
        "Error in UserNotificationModel.getUnseenCountByUserId:",
        err.message
      );
      throw new Error(
        `Error getting unseen user notification count: ${err.message}`
      );
    }
  },

  findById: async (id) => {
    const pool = getSqlPool();
    try {
      const request = pool.request();
      request.input("userNotificationId", sql.Int, id);
      const result = await request.query(`
        SELECT
          n.UserNotificationId, n.UserId, n.TicketId, n.Message, n.NotificationType, n.IsSeen, n.CreatedAt, n.UpdatedAt
        FROM UserNotifications n
        WHERE n.UserNotificationId = @userNotificationId;
      `);
      if (result.recordset && result.recordset.length > 0) {
        const record = result.recordset[0];
        return {
          id: record.UserNotificationId,
          userId: record.UserId,
          ticketId: record.TicketId,
          message: record.Message,
          notificationType: record.NotificationType,
          isSeen: record.IsSeen,
          createdAt: record.CreatedAt,
          updatedAt: record.UpdatedAt,
        };
      }
      return null;
    } catch (err) {
      console.error("Error in UserNotificationModel.findById:", err.message);
      throw new Error(
        `Error finding user notification by ID: ${err.message}. Input ID was: '${id}'`
      );
    }
  },

  delete: async (notificationId, userId) => {
    const pool = getSqlPool();
    try {
      const request = pool.request();
      request.input("userNotificationId", sql.Int, notificationId);
      request.input("userId", sql.UniqueIdentifier, userId);
      const sqlQuery = `
        DELETE FROM UserNotifications
        WHERE UserNotificationId = @userNotificationId AND UserId = @userId;
      `;
      const result = await request.query(sqlQuery);
      return result.rowsAffected[0];
    } catch (err) {
      console.error("Error in UserNotificationModel.delete:", err.message);
      throw new Error(`Error deleting user notification: ${err.message}`);
    }
  },

  deleteAllByUserId: async (userId) => {
    const pool = getSqlPool();
    try {
      const request = pool.request();
      request.input("userId", sql.UniqueIdentifier, userId);
      const sqlQuery = `
        DELETE FROM UserNotifications
        WHERE UserId = @userId;
      `;
      const result = await request.query(sqlQuery);
      return result.rowsAffected[0];
    } catch (err) {
      console.error(
        "Error in UserNotificationModel.deleteAllByUserId:",
        err.message
      );
      throw new Error(`Error deleting all user notifications: ${err.message}`);
    }
  },
};

module.exports = UserNotificationModel;
