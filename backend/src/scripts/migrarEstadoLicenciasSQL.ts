import { Client } from 'pg';
import { HOST, DATABASE, DB_USERNAME, DB_PASSWORD } from "../config/configEnv.js";

async function migrarEstadoLicencias() {
    const client = new Client({
        host: HOST || 'localhost',
        port: 5432,
        database: DATABASE,
        user: DB_USERNAME,
        password: DB_PASSWORD,
    });

    try {
        console.log("🔄 Conectando a la base de datos...");
        await client.connect();

        console.log("🔄 Paso 1: Agregando nuevo valor al enum...");
        await client.query(`
            ALTER TYPE fichas_empresa_estado_enum 
            ADD VALUE IF NOT EXISTS 'Licencia médica'
        `);
        console.log("✅ Valor 'Licencia médica' agregado al enum");

        console.log("🔄 Paso 2: Actualizando registros existentes de 'Licencia' a 'Licencia médica'...");
        const updateResult = await client.query(`
            UPDATE fichas_empresa 
            SET estado = 'Licencia médica' 
            WHERE estado = 'Licencia'
        `);
        console.log(`✅ Actualizados ${updateResult.rowCount} registros`);

        console.log("🔄 Paso 3: Eliminando valor antiguo del enum...");
        // Primero verificamos si hay registros con el valor antiguo
        const checkResult = await client.query(`
            SELECT COUNT(*) as count 
            FROM fichas_empresa 
            WHERE estado = 'Licencia'
        `);
        
        if (parseInt(checkResult.rows[0].count) === 0) {
            // Como PostgreSQL no permite eliminar valores de enum directamente,
            // vamos a recrear el enum sin el valor 'Licencia'
            await client.query(`
                -- Crear enum temporal
                CREATE TYPE fichas_empresa_estado_enum_new AS ENUM (
                    'Activo', 
                    'Licencia médica', 
                    'Permiso administrativo', 
                    'Desvinculado'
                );
                
                -- Actualizar la columna para usar el nuevo enum
                ALTER TABLE fichas_empresa 
                ALTER COLUMN estado TYPE fichas_empresa_estado_enum_new 
                USING estado::text::fichas_empresa_estado_enum_new;
                
                -- Eliminar el enum antiguo
                DROP TYPE fichas_empresa_estado_enum;
                
                -- Renombrar el enum nuevo
                ALTER TYPE fichas_empresa_estado_enum_new 
                RENAME TO fichas_empresa_estado_enum;
            `);
            console.log("✅ Enum actualizado sin el valor 'Licencia'");
        } else {
            console.log("⚠️  Aún hay registros con 'Licencia', no se puede eliminar del enum");
        }

        console.log("✅ ¡Migración completada exitosamente!");

    } catch (error) {
        console.error("❌ Error durante la migración:", error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

// Ejecutar el script
migrarEstadoLicencias(); 