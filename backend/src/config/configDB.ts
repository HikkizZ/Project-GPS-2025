/* Import the required modules. */
import { DataSource } from "typeorm";

/* Import custom modules. */
import { PORT, HOST, DATABASE, DB_USERNAME, DB_PASSWORD } from "./configEnv.js";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: HOST as string,
    port: 5432,
    username: DB_USERNAME as string,
    password: DB_PASSWORD as string,
    database: DATABASE as string,
    synchronize: true,
    logging: false,
    entities: [
        "src/entity/**/*.ts"
    ],
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
