import pkg from "pg";
const { Client } = pkg;

const client = new Client({
  connectionString:
    // "postgres://postgres:same@localhost:5432/task_management_system",
    process.env.DATABASE_URL,
});

client
  .connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err) => console.error("Database connection error", err));

export default client;
