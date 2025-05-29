/* Import the required modules. */
import { DataSource } from "typeorm";

/* Import custom modules. */
import { PORT, HOST, DATABASE, DB_USERNAME, DB_PASSWORD } from "./configEnv.js";

/* Environment */
const isProduction = process.env.NODE_ENV === "production";

/* Dynamic route for the entities according to the environment */
const entitiesPath = isProduction
    ? "build/entity/**/*.js" // For production
    : "src/entity/**/*.ts"; // For development

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "127.0.0.1",
    port: 5432,
    username: DB_USERNAME as string,
    password: DB_PASSWORD as string,
    database: DATABASE as string,
    synchronize: true,
    dropSchema: false,
    logging: false,
    entities: [entitiesPath]
});

export async function connectDB(): Promise<void> {
    try {
        await AppDataSource.initialize();
        console.log("✅ Database connected successfully.");
    } catch (error) {
        console.error("❌ Error connecting to the database: ", error);
        process.exit(1);
    }
}
