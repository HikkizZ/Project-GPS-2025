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

    // RUT del SuperAdministrador que debe ser preservado
    const superAdminRut = "11.111.111-1";

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
    // Preservar únicamente al SuperAdministrador
    console.log("🔄 Eliminando usuarios (excepto SuperAdministrador)...");
    await AppDataSource.getRepository(User)
      .createQueryBuilder()
      .delete()
      .where("rut != :superAdminRut", { superAdminRut })
      .execute();

    // Eliminar todos los trabajadores (el SuperAdmin NO es trabajador según la memoria)
    console.log("🔄 Eliminando todos los trabajadores...");
    await AppDataSource.getRepository(Trabajador)
      .createQueryBuilder()
      .delete()
      .execute();

    console.log("✅ Base de datos limpiada exitosamente");
    console.log(`📋 Usuario preservado: SuperAdministrador (${superAdminRut})`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error al limpiar la base de datos:", error);
    process.exit(1);
  }
}

limpiarBaseDatos(); 