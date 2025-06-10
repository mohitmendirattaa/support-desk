const sql = require("mssql");
const getSqlPool = require("../config/db").getSqlPool;
const bcrypt = require("bcryptjs");

const UserModel = {
  create: async ({
    name,
    employeeCode,
    contact,
    email,
    location,
    company,
    password,
    role = "user", // Default in code, but also set in SQL schema
    status = "inactive", // Default in code, but also set in SQL schema
  }) => {
    const pool = getSqlPool();
    try {
      // Hash the password before storing it securely
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const request = pool.request();
      // Input parameters for the SQL query, preventing SQL injection
      request.input("name", sql.NVarChar(255), name);
      request.input("employeeCode", sql.Int, employeeCode);
      request.input("contact", sql.NVarChar(255), contact);
      request.input("email", sql.NVarChar(255), email);
      request.input("location", sql.NVarChar(255), location);
      request.input("company", sql.NVarChar(255), company);
      request.input("password", sql.NVarChar(255), hashedPassword);
      request.input("role", sql.NVarChar(50), role);
      request.input("status", sql.NVarChar(50), status);

      const result = await request.query(`
        INSERT INTO Users (name, employeeCode, contact, email, location, company, password, role, status)
        OUTPUT INSERTED.id, INSERTED.name, INSERTED.employeeCode, INSERTED.contact,
               INSERTED.email, INSERTED.location, INSERTED.company, INSERTED.role,
               INSERTED.status, INSERTED.createdAt, INSERTED.updatedAt
        VALUES (@name, @employeeCode, @contact, @email, @location, @company, @password, @role, @status);
      `);

      // The inserted row is returned in recordset[0]
      const newUser = result.recordset[0];
      return newUser;
    } catch (err) {
      // Catch specific errors like unique constraint violations for email or employeeCode
      if (err.message.includes("Violation of UNIQUE KEY constraint")) {
        if (err.message.includes("email")) {
          throw new Error("A user with that email already exists.");
        }
        if (err.message.includes("employeeCode")) {
          // Assuming you added a UNIQUE constraint on employeeCode
          throw new Error("A user with that employee code already exists.");
        }
      }
      throw new Error(`Error creating user: ${err.message}`);
    }
  },

  /**
   * Finds a user by their email address.
   * @param {string} email - The user's email.
   * @returns {Promise<Object|null>} The user object (including password) or null if not found.
   */
  findByEmail: async (email) => {
    const pool = getSqlPool();
    try {
      const request = pool.request();
      request.input("email", sql.NVarChar(255), email);
      const result = await request.query(`
        SELECT id, name, employeeCode, contact, email, location, company, password, role, status, createdAt, updatedAt
        FROM Users
        WHERE email = @email;
      `);
      return result.recordset[0] || null; // Returns the first matching record or null
    } catch (err) {
      throw new Error(`Error finding user by email: ${err.message}`);
    }
  },

  /**
   * Finds a user by their employee code.
   * @param {number} employeeCode - The user's employee code.
   * @returns {Promise<Object|null>} The user object (including password) or null if not found.
   */
  findByEmployeeCode: async (employeeCode) => {
    const pool = getSqlPool();
    try {
      const request = pool.request();
      request.input("employeeCode", sql.Int, employeeCode);
      const result = await request.query(`
        SELECT id, name, employeeCode, contact, email, location, company, password, role, status, createdAt, updatedAt
        FROM Users
        WHERE employeeCode = @employeeCode;
      `);
      return result.recordset[0] || null;
    } catch (err) {
      throw new Error(`Error finding user by employee code: ${err.message}`);
    }
  },

  /**
   * Finds a user by their ID.
   * @param {string} id - The user's ID (GUID).
   * @returns {Promise<Object|null>} The user object (without password) or null if not found.
   */
  findById: async (id) => {
    const pool = getSqlPool();
    try {
      const request = pool.request();
      request.input("id", sql.UniqueIdentifier, id); // Use UniqueIdentifier for GUIDs
      const result = await request.query(`
        SELECT id, name, employeeCode, contact, email, location, company, role, status, createdAt, updatedAt
        FROM Users
        WHERE id = @id;
      `);
      return result.recordset[0] || null; // Returns the first matching record or null
    } catch (err) {
      throw new Error(`Error finding user by ID: ${err.message}`);
    }
  },

  /**
   * Retrieves all users from the database.
   * @returns {Promise<Array>} An array of user objects (without passwords).
   */
  findAll: async () => {
    const pool = getSqlPool();
    try {
      const result = await pool.request().query(`
        SELECT id, name, employeeCode, contact, email, location, company, role, status, createdAt, updatedAt
        FROM Users;
      `);
      return result.recordset; // Returns an array of all records
    } catch (err) {
      throw new Error(`Error retrieving all users: ${err.message}`);
    }
  },

  /**
   * Updates a user by their ID with specific fields.
   * @param {string} id - The ID (GUID) of the user to update.
   * @param {Object} fieldsToUpdate - An object containing the fields and their new values.
   * @returns {Promise<Object|null>} The updated user object (without password) or null if not found.
   */
  update: async (id, fieldsToUpdate) => {
    const pool = getSqlPool();
    try {
      const request = pool.request();
      request.input("id", sql.UniqueIdentifier, id);

      let queryParts = [];
      // Build the SET clause dynamically based on provided fields
      for (const field in fieldsToUpdate) {
        if (fieldsToUpdate.hasOwnProperty(field)) {
          // Map JS types to SQL types
          let sqlType;
          switch (field) {
            case "employeeCode":
              sqlType = sql.Int;
              break;
            case "role":
            case "status":
            case "name":
            case "email":
            case "contact":
            case "location":
            case "company":
              sqlType = sql.NVarChar(255); // Use NVarChar for strings, adjust size if needed
              break;
            // Add other types as needed, e.g., sql.Bit for booleans if you add any
            default:
              // For safety, you might want to throw an error for unsupported fields
              console.warn(`Attempted to update unsupported field: ${field}`);
              continue; // Skip this field
          }
          request.input(field, sqlType, fieldsToUpdate[field]);
          queryParts.push(`${field} = @${field}`);
        }
      }

      if (queryParts.length === 0) {
        // No fields to update
        return await UserModel.findById(id); // Return current user if nothing to update
      }

      // Always update the updatedAt timestamp
      queryParts.push("updatedAt = GETDATE()");

      const result = await request.query(`
        UPDATE Users
        SET ${queryParts.join(", ")}
        OUTPUT INSERTED.id, INSERTED.name, INSERTED.employeeCode, INSERTED.contact,
               INSERTED.email, INSERTED.location, INSERTED.company, INSERTED.role,
               INSERTED.status, INSERTED.createdAt, INSERTED.updatedAt
        WHERE id = @id;
      `);

      return result.recordset[0] || null; // Returns the updated record or null if not found/updated
    } catch (err) {
      // Handle unique constraint errors during update if any
      if (err.message.includes("Violation of UNIQUE KEY constraint")) {
        if (err.message.includes("email")) {
          throw new Error("Another user with that email already exists.");
        }
        if (err.message.includes("employeeCode")) {
          throw new Error(
            "Another user with that employee code already exists."
          );
        }
      }
      throw new Error(`Error updating user: ${err.message}`);
    }
  },
};

module.exports = UserModel;
