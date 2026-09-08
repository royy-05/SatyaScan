import { z } from "zod";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load server/.env explicitly, then fall back to root .env
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

const isDev = process.env.NODE_ENV === "development" || !process.env.NODE_ENV;

const envSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid connection string").default("postgresql://satyascan:satyascan_pass@localhost:5433/satyascan_db?schema=public"),
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters").default(isDev ? "satyascan_dev_jwt_secret_key_32bytes_minimum_length_required" : ""),
  JWT_REFRESH_SECRET: z.string().min(16, "JWT_REFRESH_SECRET must be at least 16 characters").default(isDev ? "satyascan_dev_jwt_refresh_secret_key_32bytes_minimum_length" : ""),
  JWT_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  AI_API_KEY: z.string().default("satyascan-secret-key-2026"),
  PYTHON_AI_URL: z.string().optional().default("http://localhost:8000"),
  AI_ENGINE_URL: z.string().optional().default("http://localhost:8000/scan"),
  OFFICER_INVITE_CODE: z.string().min(8).default("OFFICER-SSB-2026"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration:");
  console.error(JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

// Fallback to AI_ENGINE_URL base for PYTHON_AI_URL if not set
if (!parsed.data.PYTHON_AI_URL && parsed.data.AI_ENGINE_URL) {
  const url = new URL(parsed.data.AI_ENGINE_URL);
  parsed.data.PYTHON_AI_URL = `${url.protocol}//${url.host}`;
}

export const env = parsed.data;
