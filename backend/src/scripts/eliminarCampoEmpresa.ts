import { AppDataSource } from '../config/configDB.js';

async function eliminarCampoEmpresa() {
    try {
        console.log('🔄 Iniciando eliminación del campo empresa...');

        await AppDataSource.initialize();
        console.log('✅ Conexión a la base de datos establecida');

        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();

        try {
            // Verificar si la columna existe antes de intentar eliminarla
            const columnas = await queryRunner.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'fichas_empresa' 
                AND column_name = 'empresa'
            `);

            if (columnas.length > 0) {
                console.log('📋 Columna empresa encontrada, eliminando...');
                await queryRunner.query('ALTER TABLE fichas_empresa DROP COLUMN empresa');
                console.log('✅ Campo empresa eliminado exitosamente de la tabla fichas_empresa');
            } else {
                console.log('ℹ️  La columna empresa no existe en la tabla fichas_empresa');
            }

        } finally {
            await queryRunner.release();
        }

        console.log('✅ Proceso completado exitosamente');

    } catch (error) {
        console.error('❌ Error durante el proceso:', error);
        throw error;
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
            console.log('🔌 Conexión a la base de datos cerrada');
        }
    }
}

// Ejecutar el script
eliminarCampoEmpresa().catch(console.error);

export default eliminarCampoEmpresa; 