const odbc = require("odbc")

const connectDB = async () => {
  try {
    const pool = await odbc.pool("DSN=SQLDB64")

    const connection = await pool.connect()
    console.log("Database connected")
    return connection
  } catch (error) {
    console.log("DATABASE ERROR: ", error)
  }
}

module.exports = {
  connectDB,
}
