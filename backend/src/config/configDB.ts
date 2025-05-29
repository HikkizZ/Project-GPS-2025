/* Import the required modules. */
import { DataSource } from "typeorm";

/* Import custom modules. */
import { PORT, HOST, DATABASE, DB_USERNAME, DB_PASSWORD } from "./configEnv.js";

/* Environment */
const isProduction = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";

/* Dynamic route for the entities according to the environment */
const entitiesPath = isProduction
    ? "build/entity/**/*.js" // For production
    : "src/entity/**/*.ts"; // For development

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
    host: "127.0.0.1",
    port: 5432,
    username: DB_USERNAME as string,
    password: DB_PASSWORD as string,
    database: DATABASE as string,
    schema: isTest ? "test" : "public", // Usa esquema 'test' para pruebas
    synchronize: true,
    logging: false,
    entities: [entitiesPath]
});

export async function connectDB(): Promise<void> {
    try {
        // Crear esquema de pruebas si es necesario
        if (isTest) {
            await createTestSchema();
        }
        
        // Inicializar la conexión principal
        await AppDataSource.initialize();
        console.log(`✅ Database connected successfully to ${isTest ? 'test' : 'public'} schema.`);
    } catch (error) {
        console.error("❌ Error connecting to the database: ", error);
        process.exit(1);
    }
}
