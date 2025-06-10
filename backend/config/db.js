const sql = require("mssql"); // Import the mssql package

const connectDb = async () => {
  try {
    const config = {
      user: process.env.MSSQL_USER,
      password: process.env.MSSQL_PASSWORD,
      server: process.env.MSSQL_SERVER,
      database: process.env.MSSQL_DATABASE,
      options: {
        encrypt: process.env.MSSQL_ENCRYPT === "true", // Use true for Azure SQL Database, etc.
        trustServerCertificate:
          process.env.MSSQL_TRUST_SERVER_CERTIFICATE === "true", // Change to true for local dev with self-signed certs
      },
    };

    const pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log(
      `MSSQL connected: ${process.env.MSSQL_SERVER}/${process.env.MSSQL_DATABASE}`
    );

    global.sqlPool = pool;
  } catch (error) {
    console.error(`Error connecting to MSSQL: ${error.message}`);
    process.exit(1); // Exit the process if connection fails
  }
};

module.exports = connectDb;

module.exports.getSqlPool = () => {
  if (!global.sqlPool) {
    throw new Error(
      "MSSQL connection pool not initialized. Call connectDb() first."
    );
  }
  return global.sqlPool;
};

// const mongoose = require("mongoose");

// const connectDb = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGO_URI);
//     console.log(`MongoDB connected: ${conn.connection.host}`);
//   } catch (error) {
//     console.log(`Error: ${error.message}`);
//     process.exit(1);
//   }
// };

// module.exports = connectDb;
