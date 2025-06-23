import { AppDataSource } from "../config/configDB.js";

async function updateSueldoBase() {
    try {
        // Inicializar la conexión
        await AppDataSource.initialize();
        console.log("✅ Conexión a la base de datos establecida");

        // Ejecutar las consultas
        console.log("Actualizando tipo de datos de sueldoBase...");
        
        // Primero actualizar los valores nulos a 0
        await AppDataSource.query(`
            UPDATE "fichas_empresa" 
            SET "sueldoBase" = 0 
            WHERE "sueldoBase" IS NULL
        `);
        console.log("✅ Valores nulos actualizados a 0");

        // Luego redondear los valores existentes
        await AppDataSource.query(`
            UPDATE "fichas_empresa" 
            SET "sueldoBase" = ROUND("sueldoBase"::numeric)
            WHERE "sueldoBase" IS NOT NULL
        `);
        console.log("✅ Valores redondeados correctamente");

        // Finalmente cambiar el tipo de la columna a integer
        await AppDataSource.query(`
            ALTER TABLE "fichas_empresa" 
            ALTER COLUMN "sueldoBase" TYPE integer 
            USING (COALESCE(ROUND("sueldoBase"::numeric), 0)::integer)
        `);
        console.log("✅ Tipo de columna cambiado a integer correctamente");

        console.log("✅ Actualización completada con éxito");
    } catch (error) {
        console.error("❌ Error durante la actualización:", error);
    } finally {
        // Cerrar la conexión
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
            console.log("Conexión cerrada");
        }
    }
}

// Ejecutar el script
updateSueldoBase(); 