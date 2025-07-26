import { AppDataSource } from "../config/configDB.js";

async function agregarMotivoReactivacion() {
    try {
        await AppDataSource.initialize();
        console.log("✅ Conexión a la base de datos establecida");

        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();

        // Verificar si la columna ya existe
        const columnExists = await queryRunner.hasColumn("historial_laboral", "motivoReactivacion");
        
        if (columnExists) {
            console.log("ℹ️  La columna 'motivoReactivacion' ya existe en la tabla 'historial_laboral'");
            return;
        }

        // Agregar la columna motivoReactivacion
        await queryRunner.query(`
            ALTER TABLE historial_laboral 
            ADD COLUMN motivoReactivacion TEXT
        `);

        console.log("✅ Columna 'motivoReactivacion' agregada exitosamente a la tabla 'historial_laboral'");

        await queryRunner.release();
        await AppDataSource.destroy();
        console.log("✅ Conexión cerrada");

    } catch (error) {
        console.error("❌ Error al agregar la columna motivoReactivacion:", error);
        process.exit(1);
    }
}

// Ejecutar el script
agregarMotivoReactivacion(); 