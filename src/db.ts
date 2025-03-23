import pg from "pg";
import dotenv from "dotenv";
dotenv.config();
const pool
  = new pg.Pool({
    user: process.env.DB_USER,
    host: "localhost",
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
  });

  const connectedpool = async () => {
    try {
      const connection = await pool.connect();
      return connection;
    } catch (err) {
      console.error(err);
    }
  }
  export default connectedpool;