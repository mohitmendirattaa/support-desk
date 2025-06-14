const sql = require("mssql");
const getSqlPool = require("../config/db").getSqlPool;

const TicketModel = {
  _generateUniqueNumericPart: async () => {
    const pool = getSqlPool();
    let uniqueNumericPart;
    let isUnique = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 5;

    while (!isUnique && attempts < MAX_ATTEMPTS) {
      uniqueNumericPart = Math.floor(
        10000000 + Math.random() * 90000000
      ).toString();
      const request = pool.request();
      request.input(
        "ticketIdPattern",
        sql.NVarChar(255),
        `%${uniqueNumericPart}`
      );
      const result = await request.query(
        "SELECT COUNT(*) AS count FROM Tickets WHERE id LIKE @ticketIdPattern;" // Corrected: Removed extra ')'
      );
      if (result.recordset[0].count === 0) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      throw new Error(
        "Failed to generate a unique ticket ID after multiple attempts."
      );
    }
    return uniqueNumericPart;
  },

  _validateSubCategory: (category, subCategory) => {
    const validSAPModules = ["MM", "SD", "FI", "PP", "PM", "PS", "QM", "Other"];
    const validDigitalPlatforms = ["Platform 1", "Platform 2", "Platform 3"];

    if (category === "SAP") {
      return validSAPModules.includes(subCategory);
    } else if (category === "Digital") {
      return validDigitalPlatforms.includes(subCategory);
    }
    return false;
  },

  create: async ({
    ticketIdPrefix,
    priority,
    subCategory,
    description,
    user,
    status = "new",
    startDate,
    endDate,
    service,
    category,
    attachmentBuffer,
    attachmentMimeType,
    attachmentFileName,
  }) => {
    const pool = getSqlPool();
    try {
      if (!TicketModel._validateSubCategory(category, subCategory)) {
        throw new Error("Invalid subcategory for the selected category.");
      }

      const numericPart = await TicketModel._generateUniqueNumericPart();
      const fullTicketId = `${ticketIdPrefix}${numericPart}`;

      const request = pool.request();
      request.input("id", sql.NVarChar(255), fullTicketId);
      request.input("userId", sql.UniqueIdentifier, user);
      request.input("description", sql.NVarChar(sql.MAX), description);
      request.input("priority", sql.NVarChar(50), priority);
      request.input("subCategory", sql.NVarChar(255), subCategory);
      request.input("status", sql.NVarChar(50), status);
      request.input("startDate", sql.DateTime, startDate);
      request.input("endDate", sql.DateTime, endDate || null);
      request.input("serviceValue", sql.NVarChar(50), service);
      request.input("category", sql.NVarChar(50), category);
      request.input(
        "attachment",
        sql.VarBinary(sql.MAX),
        attachmentBuffer || null
      );
      request.input(
        "attachmentMimeType",
        sql.NVarChar(255),
        attachmentMimeType || null
      );
      request.input(
        "attachmentFileName",
        sql.NVarChar(255),
        attachmentFileName || null
      );

      const result = await request.query(`
        INSERT INTO Tickets (id, userId, description, priority, subCategory, status, startDate, endDate, ServiceType, category, Attachment, AttachmentMimeType, AttachmentFileName)
        OUTPUT INSERTED.id, INSERTED.userId, INSERTED.description, INSERTED.priority,
                INSERTED.subCategory, INSERTED.status, INSERTED.startDate, INSERTED.endDate,
                INSERTED.ServiceType, INSERTED.category, INSERTED.createdAt, INSERTED.updatedAt,
                INSERTED.Attachment, INSERTED.AttachmentMimeType, INSERTED.AttachmentFileName
        VALUES (@id, @userId, @description, @priority, @subCategory, @status, @startDate, @endDate, @serviceValue, @category, @attachment, @attachmentMimeType, @attachmentFileName);
      `);

      return result.recordset[0];
    } catch (err) {
      if (err.message.includes("Violation of PRIMARY KEY constraint")) {
        throw new Error(
          "A ticket with this ID already exists (collision during generation). Please try again."
        );
      }
      throw new Error(`Error creating ticket: ${err.message}`);
    }
  },

  findByUserId: async (userId) => {
    const pool = getSqlPool();
    try {
      const request = pool.request();
      request.input("userId", sql.UniqueIdentifier, userId);
      const result = await request.query(`
        SELECT id, userId, description, priority, subCategory, status, startDate, endDate, ServiceType, category, createdAt, updatedAt, Attachment, AttachmentMimeType, AttachmentFileName
        FROM Tickets
        WHERE userId = @userId
        ORDER BY createdAt DESC;
      `);
      return result.recordset.map((record) => ({
        id: record.id,
        userId: record.userId,
        description: record.description,
        priority: record.priority,
        subCategory: record.subCategory,
        status: record.status,
        startDate: record.startDate,
        endDate: record.endDate,
        ServiceType: record.ServiceType, // Explicitly map ServiceType
        category: record.category,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        attachment: record.Attachment
          ? record.Attachment.toString("base64")
          : null,
        attachmentMimeType: record.AttachmentMimeType, // Explicitly added
        attachmentFileName: record.AttachmentFileName, // Explicitly added
      }));
    } catch (err) {
      throw new Error(`Error finding tickets by user ID: ${err.message}`);
    }
  },

  findById: async (id) => {
    const pool = getSqlPool();
    try {
      const request = pool.request();
      request.input("id", sql.NVarChar(255), id);
      const result = await request.query(`
        SELECT id, userId, description, priority, subCategory, status, startDate, endDate, ServiceType, category, createdAt, updatedAt, Attachment, AttachmentMimeType, AttachmentFileName
        FROM Tickets
        WHERE id = @id;
      `);
      const record = result.recordset[0];
      if (record) {
        return {
          id: record.id,
          userId: record.userId,
          description: record.description,
          priority: record.priority,
          subCategory: record.subCategory,
          status: record.status,
          startDate: record.startDate,
          endDate: record.endDate,
          ServiceType: record.ServiceType, // Explicitly map ServiceType
          category: record.category,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
          attachment: record.Attachment
            ? record.Attachment.toString("base64")
            : null,
          attachmentMimeType: record.AttachmentMimeType, // Explicitly added
          attachmentFileName: record.AttachmentFileName, // Explicitly added
        };
      }
      return null;
    } catch (err) {
      throw new Error(`Error finding ticket by ID: ${err.message}`);
    }
  },

  findByIdWithUserDetails: async (id) => {
    const pool = getSqlPool();
    try {
      const request = pool.request();
      request.input("id", sql.NVarChar(255), id);
      const result = await request.query(`
        SELECT
          t.id,
          t.userId,
          t.description,
          t.priority,
          t.subCategory,
          t.status,
          t.startDate,
          t.endDate,
          t.ServiceType AS service,
          t.category,
          t.createdAt,
          t.updatedAt,
          t.Attachment,
          t.AttachmentMimeType,
          t.AttachmentFileName,
          u.id AS 'user.id',
          u.name AS 'user.name',
          u.email AS 'user.email',
          u.employeeCode AS 'user.employeeCode'
        FROM
          Tickets t
        JOIN
          Users u ON t.userId = u.id
        WHERE
          t.id = @id;
      `);

      if (result.recordset.length > 0) {
        const record = result.recordset[0];
        return {
          id: record.id,
          userId: record.userId,
          description: record.description,
          priority: record.priority,
          subCategory: record.subCategory,
          status: record.status,
          startDate: record.startDate,
          endDate: record.endDate,
          service: record.service,
          category: record.category,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
          attachment: record.Attachment
            ? record.Attachment.toString("base64")
            : null,
          attachmentMimeType: record.AttachmentMimeType,
          attachmentFileName: record.AttachmentFileName,
          user: {
            id: record["user.id"],
            name: record["user.name"],
            email: record["user.email"],
            employeeCode: record["user.employeeCode"],
          },
        };
      }
      return null;
    } catch (err) {
      throw new Error(
        `Error finding ticket by ID with user details: ${err.message}`
      );
    }
  },

  update: async (id, fieldsToUpdate) => {
    const pool = getSqlPool();
    try {
      const request = pool.request();
      request.input("id", sql.NVarChar(255), id);

      let queryParts = [];
      for (const field in fieldsToUpdate) {
        if (
          fieldsToUpdate.hasOwnProperty(field) &&
          field !== "id" &&
          field !== "userId" &&
          field !== "createdAt" &&
          field !== "ticketIdPrefix"
        ) {
          let dbFieldName = field;
          let sqlType;
          let value = fieldsToUpdate[field];

          switch (field) {
            case "service":
              dbFieldName = "ServiceType";
              sqlType = sql.NVarChar(50);
              break;
            case "attachmentBuffer":
              dbFieldName = "Attachment";
              sqlType = sql.VarBinary(sql.MAX);
              break;
            case "attachmentMimeType":
              dbFieldName = "AttachmentMimeType";
              sqlType = sql.NVarChar(255);
              break;
            case "attachmentFileName":
              dbFieldName = "AttachmentFileName";
              sqlType = sql.NVarChar(255);
              break;
            case "description":
              sqlType = sql.NVarChar(sql.MAX);
              break;
            case "startDate":
            case "endDate":
              sqlType = sql.DateTime;
              break;
            case "status":
            case "category":
            case "priority":
            case "subCategory":
              sqlType = sql.NVarChar(255);
              break;
            default:
              continue;
          }
          request.input(field, sqlType, value || null);
          queryParts.push(`${dbFieldName} = @${field}`);
        }
      }

      if (queryParts.length === 0) {
        return await TicketModel.findById(id);
      }

      queryParts.push("updatedAt = GETUTCDATE()");

      const result = await request.query(`
        UPDATE Tickets
        SET ${queryParts.join(", ")}
        OUTPUT INSERTED.id, INSERTED.userId, INSERTED.description, INSERTED.priority,
                INSERTED.subCategory, INSERTED.status, INSERTED.startDate, INSERTED.endDate,
                INSERTED.ServiceType, INSERTED.category, INSERTED.createdAt, INSERTED.updatedAt,
                INSERTED.Attachment, INSERTED.AttachmentMimeType, INSERTED.AttachmentFileName
        WHERE id = @id;
      `);

      const updatedRecord = result.recordset[0];
      if (updatedRecord) {
        return {
          id: updatedRecord.id,
          userId: updatedRecord.userId,
          description: updatedRecord.description,
          priority: updatedRecord.priority,
          subCategory: updatedRecord.subCategory,
          status: updatedRecord.status,
          startDate: updatedRecord.startDate,
          endDate: updatedRecord.endDate,
          ServiceType: updatedRecord.ServiceType, // Explicitly map ServiceType
          category: updatedRecord.category,
          createdAt: updatedRecord.createdAt,
          updatedAt: updatedRecord.updatedAt,
          attachment: updatedRecord.Attachment
            ? updatedRecord.Attachment.toString("base64")
            : null,
          attachmentMimeType: updatedRecord.AttachmentMimeType, // Explicitly added
          attachmentFileName: updatedRecord.AttachmentFileName, // Explicitly added
        };
      }
      return null;
    } catch (err) {
      throw new Error(`Error updating ticket: ${err.message}`);
    }
  },

  delete: async (id) => {
    const pool = getSqlPool();
    try {
      const request = pool.request();
      request.input("id", sql.NVarChar(255), id);
      const result = await request.query(`
        DELETE FROM Tickets
        WHERE id = @id;
      `);
      return result.rowsAffected[0] > 0;
    } catch (err) {
      throw new Error(`Error deleting ticket: ${err.message}`);
    }
  },

  findAllWithUserDetails: async () => {
    const pool = getSqlPool();
    try {
      const request = pool.request();
      const result = await request.query(`
        SELECT
            t.id,
            t.userId,
            t.description,
            t.priority,
            t.subCategory,
            t.status,
            t.startDate,
            t.endDate,
            t.ServiceType AS service,
            t.category,
            t.createdAt,
            t.updatedAt,
            t.Attachment,
            t.AttachmentMimeType,
            t.AttachmentFileName,
            u.id AS 'user.id',
            u.name AS 'user.name',
            u.email AS 'user.email'
        FROM
            Tickets t
        JOIN
            Users u ON t.userId = u.id
        ORDER BY
            t.createdAt DESC;
      `);

      return result.recordset.map((record) => ({
        id: record.id,
        userId: record.userId,
        description: record.description,
        priority: record.priority,
        subCategory: record.subCategory,
        status: record.status,
        startDate: record.startDate,
        endDate: record.endDate,
        service: record.service,
        category: record.category,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        attachment: record.Attachment
          ? record.Attachment.toString("base64")
          : null,
        attachmentMimeType: record.AttachmentMimeType,
        attachmentFileName: record.AttachmentFileName,
        user: {
          id: record["user.id"],
          name: record["user.name"],
          email: record["user.email"],
        },
      }));
    } catch (err) {
      throw new Error(
        `Error finding all tickets with user details: ${err.message}`
      );
    }
  },
};

module.exports = TicketModel;
