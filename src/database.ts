import { DataSource } from "typeorm";
import { BannedWord } from "./entities/BannedWord";
import { Warning } from "./entities/Warning";
import "dotenv/config";
import { VoiceChatRole } from "./entities/VoiceRoles";
import { Users } from "./entities/Users";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [BannedWord, Warning, VoiceChatRole, Users],
  synchronize: true,
});

export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize(); // Initialize the connection
    console.log("Database connection successful");
  } catch (error) {
    console.error("Error connecting to database:", error);
  }
};
