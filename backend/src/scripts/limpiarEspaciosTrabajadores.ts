import { AppDataSource } from "../config/configDB.js";
import { Trabajador } from "../entity/recursosHumanos/trabajador.entity.js";

/**
 * Script para limpiar espacios extra en trabajadores existentes
 * Ejecutar: npm run script:limpiar-espacios-trabajadores
 */

async function limpiarEspaciosTrabajadores() {
    try {
        console.log('🚀 Iniciando limpieza de espacios en trabajadores...');
        
        // Inicializar conexión a la base de datos
        await AppDataSource.initialize();
        console.log('✅ Conexión a base de datos establecida');

        const trabajadorRepo = AppDataSource.getRepository(Trabajador);
        
        // Obtener todos los trabajadores
        const trabajadores = await trabajadorRepo.find();
        console.log(`📊 Encontrados ${trabajadores.length} trabajadores para revisar`);

        let trabajadoresActualizados = 0;
        let errores = 0;

        for (const trabajador of trabajadores) {
            try {
                let necesitaActualizacion = false;
                const datosOriginales = { ...trabajador };

                // Limpiar cada campo de texto
                const camposALimpiar = [
                    'nombres', 
                    'apellidoPaterno', 
                    'apellidoMaterno', 
                    'telefono', 
                    'correoPersonal', 
                    'numeroEmergencia', 
                    'direccion', 
                    'rut'
                ];

                for (const campo of camposALimpiar) {
                    const valorOriginal = (trabajador as any)[campo];
                    if (valorOriginal && typeof valorOriginal === 'string') {
                        const valorLimpio = valorOriginal.trim();
                        if (valorOriginal !== valorLimpio) {
                            (trabajador as any)[campo] = valorLimpio;
                            necesitaActualizacion = true;
                            console.log(`  📝 ${campo}: "${valorOriginal}" → "${valorLimpio}"`);
                        }
                    }
                }

                // Solo actualizar si hay cambios
                if (necesitaActualizacion) {
                    await trabajadorRepo.save(trabajador);
                    trabajadoresActualizados++;
                    console.log(`✅ Trabajador ${trabajador.nombres} ${trabajador.apellidoPaterno} actualizado`);
                }

            } catch (error) {
                errores++;
                console.error(`❌ Error al actualizar trabajador ID ${trabajador.id}:`, error);
            }
        }

        console.log('\n📋 RESUMEN DE LA LIMPIEZA:');
        console.log(`✅ Trabajadores revisados: ${trabajadores.length}`);
        console.log(`🔧 Trabajadores actualizados: ${trabajadoresActualizados}`);
        console.log(`❌ Errores: ${errores}`);
        
        if (trabajadoresActualizados > 0) {
            console.log('\n🎉 Limpieza completada exitosamente!');
            console.log('🔍 Todos los espacios extra han sido eliminados');
            console.log('📊 Los filtros y búsquedas ahora funcionarán correctamente');
        } else {
            console.log('\n✨ No se encontraron espacios extra para limpiar');
            console.log('📊 Todos los datos ya estaban limpios');
        }

    } catch (error) {
        console.error('💥 Error fatal durante la limpieza:', error);
        process.exit(1);
    } finally {
        // Cerrar conexión
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
            console.log('🔌 Conexión a base de datos cerrada');
        }
        process.exit(0);
    }
}

// Ejecutar el script
limpiarEspaciosTrabajadores(); 