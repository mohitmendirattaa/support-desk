const sql = require("mssql");
const getSqlPool = require("../config/db").getSqlPool;

const TicketModel = {
  // Private helper to generate a unique numeric part for ticket IDs
  _generateUniqueNumericPart: async () => {
    const pool = getSqlPool();
    let uniqueNumericPart;
    let isUnique = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 5; // Max attempts to find a unique ID

    while (!isUnique && attempts < MAX_ATTEMPTS) {
      // Generate an 8-digit random number
      uniqueNumericPart = Math.floor(
        10000000 + Math.random() * 90000000
      ).toString();
      const request = pool.request();
      request.input(
        "ticketIdPattern",
        sql.NVarChar(255),
        `%${uniqueNumericPart}` // Check for existing IDs ending with this pattern
      );
      const result = await request.query(
        "SELECT COUNT(*) AS count FROM Tickets WHERE id LIKE @ticketIdPattern;"
      );
      if (result.recordset[0].count === 0) {
        isUnique = true; // Found a unique part
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

  // Private helper to validate subcategories based on category
  _validateSubCategory: (category, subCategory) => {
    const validSAPModules = ["MM", "SD", "FI", "PP", "PM", "PS", "QM", "Other"];
    const validDigitalPlatforms = ["Platform 1", "Platform 2", "Platform 3"];

    if (category === "SAP") {
      return validSAPModules.includes(subCategory);
    } else if (category === "Digital") {
      return validDigitalPlatforms.includes(subCategory);
    }
    return false; // Invalid category or subCategory
  },

  create: async ({
    ticketIdPrefix,
    priority,
    subCategory,
    description,
    user, // This should be the userId (GUID)
    status = "new",
    startDate,
    endDate,
    service, // Maps to ServiceType in DB
    category,
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
      request.input("userId", sql.UniqueIdentifier, user); // User ID as GUID
      request.input("description", sql.NVarChar(sql.MAX), description);
      request.input("priority", sql.NVarChar(50), priority);
      request.input("subCategory", sql.NVarChar(255), subCategory);
      request.input("status", sql.NVarChar(50), status);
      request.input("startDate", sql.DateTime, startDate);
      request.input("endDate", sql.DateTime, endDate || null); // endDate can be null
      request.input("serviceValue", sql.NVarChar(50), service); // `serviceValue` maps to `ServiceType` column
      request.input("category", sql.NVarChar(50), category);

      const result = await request.query(`
        INSERT INTO Tickets (id, userId, description, priority, subCategory, status, startDate, endDate, ServiceType, category)
        OUTPUT INSERTED.id, INSERTED.userId, INSERTED.description, INSERTED.priority,
                INSERTED.subCategory, INSERTED.status, INSERTED.startDate, INSERTED.endDate,
                INSERTED.ServiceType, INSERTED.category, INSERTED.createdAt, INSERTED.updatedAt
        VALUES (@id, @userId, @description, @priority, @subCategory, @status, @startDate, @endDate, @serviceValue, @category);
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
        SELECT id, userId, description, priority, subCategory, status, startDate, endDate, ServiceType, category, createdAt, updatedAt
        FROM Tickets
        WHERE userId = @userId
        ORDER BY createdAt DESC;
      `);
      return result.recordset;
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
        SELECT id, userId, description, priority, subCategory, status, startDate, endDate, ServiceType, category, createdAt, updatedAt
        FROM Tickets
        WHERE id = @id;
      `);
      return result.recordset[0] || null;
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
          t.ServiceType AS service, -- Alias to 'service' for frontend consistency
          t.category,
          t.createdAt,
          t.updatedAt,
          u.id AS 'user.id',         -- User's ID for nested object
          u.name AS 'user.name',     -- User's name
          u.email AS 'user.email',    -- User's email
          u.employeeCode AS 'user.employeeCode'
        FROM
          Tickets t
        JOIN
          Users u ON t.userId = u.id -- Assuming 'Users' is your user table and 'id' is its primary key
        WHERE
          t.id = @id;
      `);

      // Transform the flat recordset into a nested 'user' object as expected by the frontend
      if (result.recordset.length > 0) {
        const record = result.recordset[0];
        return {
          id: record.id,
          userId: record.userId, // Keep the direct userId for backend context
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
          user: {
            id: record["user.id"],
            name: record["user.name"],
            email: record["user.email"],
            employeeCode: record["user.employeeCode"],
          },
        };
      }
      return null; // No ticket found
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
        // Exclude system-managed or immutable fields
        if (
          fieldsToUpdate.hasOwnProperty(field) &&
          field !== "id" &&
          field !== "userId" &&
          field !== "createdAt" &&
          field !== "ticketIdPrefix" // Assuming this is also immutable after creation
        ) {
          let dbFieldName = field;
          if (field === "service") {
            dbFieldName = "ServiceType"; // Map 'service' from input to 'ServiceType' column in DB
          }

          let sqlType;
          switch (field) {
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
            case "service": // Corresponds to @service input
              sqlType = sql.NVarChar(255);
              break;
            default:
              continue; // Skip unknown fields
          }
          request.input(field, sqlType, fieldsToUpdate[field]);
          queryParts.push(`${dbFieldName} = @${field}`);
        }
      }

      if (queryParts.length === 0) {
        return await TicketModel.findById(id); // No fields to update, return current state
      }

      queryParts.push("updatedAt = GETUTCDATE()"); // Automatically update updatedAt timestamp

      const result = await request.query(`
        UPDATE Tickets
        SET ${queryParts.join(", ")}
        OUTPUT INSERTED.id, INSERTED.userId, INSERTED.description, INSERTED.priority,
                INSERTED.subCategory, INSERTED.status, INSERTED.startDate, INSERTED.endDate,
                INSERTED.ServiceType, INSERTED.category, INSERTED.createdAt, INSERTED.updatedAt
        WHERE id = @id;
      `);

      return result.recordset[0] || null; // Return the updated record
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
      return result.rowsAffected[0] > 0; // Returns true if at least one row was affected
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
            t.ServiceType AS service, -- Alias to 'service' for frontend consistency
            t.category,
            t.createdAt,
            t.updatedAt,
            u.id AS 'user.id',       -- User's ID for nested object
            u.name AS 'user.name',   -- User's name
            u.email AS 'user.email'  -- User's email
        FROM
            Tickets t
        JOIN
            Users u ON t.userId = u.id -- Assuming 'Users' is your user table and 'id' is its primary key
        ORDER BY
            t.createdAt DESC;
      `);

      // Transform the flat recordset into nested 'user' objects as expected by the frontend
      return result.recordset.map((record) => ({
        id: record.id,
        userId: record.userId, // Keep the direct userId for backend context
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
        user: {
          id: record["user.id"], // Correctly assign the user's ID
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
