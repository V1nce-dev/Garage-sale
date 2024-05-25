import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DB_URL,
});

const db = drizzle(pool);

const connectDB = async () => {
  console.log("migration started...");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("migration ended...");
  process.exit(0);
};

connectDB().catch((error) => {
  console.error(error);
  process.exit(0);
});
