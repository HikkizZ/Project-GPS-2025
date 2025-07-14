import { AppDataSource } from "../config/configDB.js";
import { User } from "../entity/user.entity.js";

/**
 * Script para limpiar espacios extra en usuarios existentes
 * Ejecutar: npm run limpiar-espacios-usuarios
 */

async function limpiarEspaciosUsuarios() {
    try {
        console.log('🚀 Iniciando limpieza de espacios en usuarios...');
        
        // Inicializar conexión a la base de datos
        await AppDataSource.initialize();
        console.log('✅ Conexión a base de datos establecida');

        const userRepo = AppDataSource.getRepository(User);
        
        // Obtener todos los usuarios
        const usuarios = await userRepo.find();
        console.log(`📊 Encontrados ${usuarios.length} usuarios para revisar`);

        let usuariosActualizados = 0;
        let errores = 0;

        for (const usuario of usuarios) {
            try {
                let necesitaActualizacion = false;
                const datosOriginales = { ...usuario };

                // Limpiar cada campo de texto
                const camposALimpiar = [
                    'name',
                    'email',
                    'rut'
                ];

                for (const campo of camposALimpiar) {
                    const valorOriginal = (usuario as any)[campo];
                    if (valorOriginal && typeof valorOriginal === 'string') {
                        // Limpiar espacios al inicio/final Y espacios dobles en el medio
                        const valorLimpio = valorOriginal.trim().replace(/\s+/g, ' ');
                        if (valorOriginal !== valorLimpio) {
                            (usuario as any)[campo] = valorLimpio;
                            necesitaActualizacion = true;
                            console.log(`  📝 ${campo}: "${valorOriginal}" → "${valorLimpio}"`);
                        }
                    }
                }

                // Solo actualizar si hay cambios
                if (necesitaActualizacion) {
                    await userRepo.save(usuario);
                    usuariosActualizados++;
                    console.log(`✅ Usuario ${usuario.name} (${usuario.email}) actualizado`);
                }

            } catch (error) {
                errores++;
                console.error(`❌ Error al actualizar usuario ID ${usuario.id}:`, error);
            }
        }

        console.log('\n📋 RESUMEN DE LA LIMPIEZA:');
        console.log(`✅ Usuarios revisados: ${usuarios.length}`);
        console.log(`🔧 Usuarios actualizados: ${usuariosActualizados}`);
        console.log(`❌ Errores: ${errores}`);
        
        if (usuariosActualizados > 0) {
            console.log('\n🎉 Limpieza completada exitosamente!');
            console.log('🔍 Todos los espacios extra han sido eliminados');
            console.log('📊 Los nombres de usuarios ahora están limpios');
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
limpiarEspaciosUsuarios(); 