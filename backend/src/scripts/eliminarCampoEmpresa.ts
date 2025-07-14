import { AppDataSource } from '../config/configDB.js';

async function eliminarCampoEmpresa() {
    try {
        await AppDataSource.initialize();

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
                await queryRunner.query('ALTER TABLE fichas_empresa DROP COLUMN empresa');
            }

        } finally {
            await queryRunner.release();
        }

    } catch (error) {
        console.error('❌ Error durante el proceso:', error);
        throw error;
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}

// Ejecutar el script
eliminarCampoEmpresa().catch(console.error);

export default eliminarCampoEmpresa; 