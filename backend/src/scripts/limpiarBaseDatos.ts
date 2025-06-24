import { AppDataSource } from "../config/configDB.js";
import { Trabajador } from "../entity/recursosHumanos/trabajador.entity.js";
import { FichaEmpresa } from "../entity/recursosHumanos/fichaEmpresa.entity.js";
import { User } from "../entity/user.entity.js";
import { HistorialLaboral } from "../entity/recursosHumanos/historialLaboral.entity.js";
import { LicenciaPermiso } from "../entity/recursosHumanos/licenciaPermiso.entity.js";

async function limpiarBaseDatos() {
  try {
    console.log("🧹 Iniciando limpieza de la base de datos...");
    
    // Inicializar conexión
    await AppDataSource.initialize();
    console.log("✅ Conexión a la base de datos establecida");

    // Limpiar en orden correcto (por dependencias)
    console.log("🔄 Eliminando licencias y permisos...");
    await AppDataSource.getRepository(LicenciaPermiso)
      .createQueryBuilder()
      .delete()
      .execute();

    console.log("🔄 Eliminando historial laboral...");
    await AppDataSource.getRepository(HistorialLaboral)
      .createQueryBuilder()
      .delete()
      .execute();

    console.log("🔄 Eliminando fichas de empresa...");
    await AppDataSource.getRepository(FichaEmpresa)
      .createQueryBuilder()
      .delete()
      .execute();

    // IMPORTANTE: Eliminar usuarios primero (userauth) antes que trabajadores
    // porque User tiene una FK hacia Trabajador por RUT
    console.log("🔄 Eliminando usuarios (excepto admin)...");
    await AppDataSource.getRepository(User)
      .createQueryBuilder()
      .delete()
      .where("rut NOT IN (:...ruts)", { 
        ruts: [] 
      })
      .execute();

    console.log("🔄 Eliminando trabajadores (excepto admin)...");
    await AppDataSource.getRepository(Trabajador)
      .createQueryBuilder()
      .delete()
      .where("rut NOT IN (:...ruts)", { 
        ruts: [] 
      })
      .execute();

    console.log("✅ Base de datos limpiada exitosamente");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error al limpiar la base de datos:", error);
    process.exit(1);
  }
}

limpiarBaseDatos(); 