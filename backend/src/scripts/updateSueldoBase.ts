import { AppDataSource } from "../config/configDB.js";

async function updateSueldoBase() {
    try {
        // Inicializar la conexión
        await AppDataSource.initialize();

        // Primero actualizar los valores nulos a 0
        await AppDataSource.query(`
            UPDATE "fichas_empresa" 
            SET "sueldoBase" = 0 
            WHERE "sueldoBase" IS NULL
        `);

        // Luego redondear los valores existentes
        await AppDataSource.query(`
            UPDATE "fichas_empresa" 
            SET "sueldoBase" = ROUND("sueldoBase"::numeric)
            WHERE "sueldoBase" IS NOT NULL
        `);

        // Finalmente cambiar el tipo de la columna a integer
        await AppDataSource.query(`
            ALTER TABLE "fichas_empresa" 
            ALTER COLUMN "sueldoBase" TYPE integer 
            USING (COALESCE(ROUND("sueldoBase"::numeric), 0)::integer)
        `);

    } catch (error) {
        console.error("❌ Error durante la actualización:", error);
    } finally {
        // Cerrar la conexión
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}

// Ejecutar el script
updateSueldoBase(); 