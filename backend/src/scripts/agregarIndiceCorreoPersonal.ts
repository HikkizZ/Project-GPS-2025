import { AppDataSource } from "../config/configDB.js";

async function agregarIndiceCorreoPersonal() {
    try {
        console.log("🔄 Conectando a la base de datos...");
        await AppDataSource.initialize();
        
        console.log("📊 Verificando si el índice ya existe...");
        const queryRunner = AppDataSource.createQueryRunner();
        
        // Verificar si el índice ya existe
        const indexExists = await queryRunner.query(`
            SELECT 1 FROM pg_indexes 
            WHERE indexname = 'IDX_TRABAJADORES_CORREO_PERSONAL'
        `);
        
        if (indexExists.length > 0) {
            console.log("✅ El índice IDX_TRABAJADORES_CORREO_PERSONAL ya existe");
            return;
        }
        
        console.log("🔧 Creando índice único para correoPersonal...");
        
        // Crear el índice único
        await queryRunner.query(`
            CREATE UNIQUE INDEX IDX_TRABAJADORES_CORREO_PERSONAL 
            ON trabajadores (correoPersonal)
        `);
        
        console.log("✅ Índice único IDX_TRABAJADORES_CORREO_PERSONAL creado exitosamente");
        
        // Verificar que no hay duplicados antes de crear el índice
        console.log("🔍 Verificando duplicados existentes...");
        const duplicados = await queryRunner.query(`
            SELECT correoPersonal, COUNT(*) as cantidad
            FROM trabajadores 
            WHERE correoPersonal IS NOT NULL 
            GROUP BY correoPersonal 
            HAVING COUNT(*) > 1
        `);
        
        if (duplicados.length > 0) {
            console.log("⚠️  ADVERTENCIA: Se encontraron correos duplicados:");
            duplicados.forEach((duplicado: any) => {
                console.log(`   - ${duplicado.correopersonal}: ${duplicado.cantidad} registros`);
            });
            console.log("❌ No se puede crear el índice único debido a duplicados existentes");
            console.log("💡 Por favor, resuelve los duplicados antes de ejecutar este script");
            return;
        }
        
        console.log("✅ No se encontraron duplicados. El índice se creó correctamente");
        
    } catch (error) {
        console.error("❌ Error al agregar índice:", error);
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}

// Ejecutar el script
agregarIndiceCorreoPersonal()
    .then(() => {
        console.log("🎉 Script completado");
        process.exit(0);
    })
    .catch((error) => {
        console.error("💥 Error en el script:", error);
        process.exit(1);
    }); 