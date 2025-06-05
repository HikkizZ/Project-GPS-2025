import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __envPath = path.resolve(__dirname, "./.env");

dotenv.config({ path: __envPath });

// Export the configuration object.
export const PORT: string | undefined = process.env.PORT;
export const HOST: string | undefined = process.env.HOST;
export const DATABASE: string | undefined = process.env.DATABASE;
export const DB_USERNAME: string | undefined = process.env.DB_USERNAME;
export const DB_PASSWORD: string | undefined = process.env.DB_PASSWORD;
export const ACCESS_TOKEN_SECRET: string | undefined = process.env.ACCESS_TOKEN_SECRET;
console.log('ACCESS_TOKEN_SECRET:', ACCESS_TOKEN_SECRET);
export const cookieKey: string | undefined = process.env.cookieKey;
