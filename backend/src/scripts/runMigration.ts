import { AppDataSource } from "../config/configDB.js";

async function runMigration() {
    try {
        await AppDataSource.initialize();
        console.log("✅ Database connection established");

        await AppDataSource.runMigrations();
        console.log("✅ Migration completed successfully");

        await AppDataSource.destroy();
        console.log("✅ Database connection closed");
    } catch (error) {
        console.error("❌ Error during migration:", error);
        process.exit(1);
    }
}

runMigration(); 