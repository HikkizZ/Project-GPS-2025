import { AppDataSource } from "../config/configDB.js";
import { Trabajador } from "../entity/recursosHumanos/trabajador.entity.js";
import { FichaEmpresa } from "../entity/recursosHumanos/fichaEmpresa.entity.js";
import { User } from "../entity/user.entity.js";
import { HistorialLaboral } from "../entity/recursosHumanos/historialLaboral.entity.js";
import { LicenciaPermiso } from "../entity/recursosHumanos/licenciaPermiso.entity.js";
import { Capacitacion } from "../entity/recursosHumanos/capacitacion.entity.js";

async function limpiarBaseDatos() {
  try {
    console.log("🧹 Iniciando limpieza de la base de datos...");
    
    // Inicializar conexión
    await AppDataSource.initialize();
    console.log("✅ Conexión a la base de datos establecida");

    // Limpiar en orden correcto (por dependencias)
    console.log("🔄 Eliminando capacitaciones...");
    await AppDataSource.getRepository(Capacitacion).delete({});

    console.log("🔄 Eliminando licencias y permisos...");
    await AppDataSource.getRepository(LicenciaPermiso).delete({});

    console.log("🔄 Eliminando historial laboral...");
    await AppDataSource.getRepository(HistorialLaboral).delete({});

    console.log("🔄 Eliminando fichas de empresa...");
    await AppDataSource.getRepository(FichaEmpresa).delete({});

    // IMPORTANTE: Eliminar usuarios primero (userauth) antes que trabajadores
    // porque User tiene una FK hacia Trabajador por RUT
    console.log("🔄 Eliminando usuarios (excepto admin y RRHH)...");
    await AppDataSource.getRepository(User)
      .createQueryBuilder()
      .delete()
      .where("rut NOT IN (:...ruts)", { 
        ruts: ['11.111.111-1', '22.222.222-2'] 
      })
      .execute();

    console.log("🔄 Eliminando trabajadores (excepto admin y RRHH)...");
    await AppDataSource.getRepository(Trabajador)
      .createQueryBuilder()
      .delete()
      .where("rut NOT IN (:...ruts)", { 
        ruts: ['11.111.111-1', '22.222.222-2'] 
      })
      .execute();

    // Verificar que quedaron solo los usuarios necesarios
    const usuariosRestantes = await AppDataSource.getRepository(User).find();
    const trabajadoresRestantes = await AppDataSource.getRepository(Trabajador).find();

    console.log(`✅ Limpieza completada:`);
    console.log(`   - Usuarios restantes: ${usuariosRestantes.length}`);
    console.log(`   - Trabajadores restantes: ${trabajadoresRestantes.length}`);
    
    usuariosRestantes.forEach(user => {
      console.log(`   👤 ${user.name} (${user.email}) - ${user.role}`);
    });

    console.log("🎉 Base de datos limpiada exitosamente");

  } catch (error) {
    console.error("❌ Error al limpiar la base de datos:", error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(0);
  }
}

// Ejecutar el script
limpiarBaseDatos(); 