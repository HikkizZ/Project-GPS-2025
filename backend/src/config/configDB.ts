/* Import the required modules. */
import { DataSource } from "typeorm";
import { config } from "dotenv";
import { User } from "../entity/user.entity.js";
import { Trabajador } from "../entity/recursosHumanos/trabajador.entity.js";
import { HistorialLaboral } from "../entity/recursosHumanos/historialLaboral.entity.js";
import { FichaEmpresa } from "../entity/recursosHumanos/fichaEmpresa.entity.js";
import { LicenciaPermiso } from "../entity/recursosHumanos/licenciaPermiso.entity.js";

/* Import custom modules. */
import { PORT, HOST, DATABASE, DB_USERNAME, DB_PASSWORD } from "./configEnv.js";

/* Environment */
const isProduction = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";
const isDevelopment = !isProduction && !isTest;

/* Dynamic route for the entities according to the environment */
const entitiesPath = isProduction
    ? "build/entity/**/*.js" // For production
    : "src/entity/**/*.ts"; // For development

config();

// Crear una conexión temporal para gestionar el esquema
async function createTestSchema() {
    if (!isTest) return;
    
    const tempDataSource = new DataSource({
        type: "postgres",
        host: "127.0.0.1",
        port: 5432,
        username: DB_USERNAME as string,
        password: DB_PASSWORD as string,
        database: DATABASE as string
    });

    try {
        await tempDataSource.initialize();
        await tempDataSource.query('DROP SCHEMA IF EXISTS test CASCADE');
        await tempDataSource.query('CREATE SCHEMA test');
        console.log('✅ Test schema created successfully');
    } catch (error) {
        console.error('❌ Error creating test schema:', error);
        throw error;
    } finally {
        if (tempDataSource.isInitialized) {
            await tempDataSource.destroy();
        }
    }
}

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DATABASE || "gps_db",
    synchronize: false,
    logging: ["error", "warn"],
    entities: [
        entitiesPath
    ],
    subscribers: [],
    migrations: [],
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

export const initializeDatabase = async () => {
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            console.log("✅ Base de datos conectada");
        }
    } catch (error) {
        console.error("❌ Error connecting to the database:", error);
        throw error;
    }
};
