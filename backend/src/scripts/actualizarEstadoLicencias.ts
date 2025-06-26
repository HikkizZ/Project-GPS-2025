import { AppDataSource } from "../config/configDB.js";

export async function actualizarEstadoLicencias() {
    try {
        await AppDataSource.initialize();
        
        // Actualizar todos los registros que tengan "Licencia" a "Licencia médica"
        await AppDataSource.query(`
            UPDATE fichas_empresa 
            SET estado = 'Licencia médica' 
            WHERE estado = 'Licencia'
        `);
        
        await AppDataSource.destroy();
        
    } catch (error) {
        console.error("❌ Error al actualizar estados de licencias:", error);
        process.exit(1);
    }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    actualizarEstadoLicencias();
} 