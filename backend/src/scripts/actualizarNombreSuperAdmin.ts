import { AppDataSource } from "../config/configDB.js";
import { User } from "../entity/user.entity.js";

async function actualizarNombreSuperAdmin() {
  try {
    console.log("🔄 Iniciando actualización del nombre del Super Administrador...");
    
    // Inicializar conexión
    await AppDataSource.initialize();
    console.log("✅ Conexión a la base de datos establecida");

    const userRepo = AppDataSource.getRepository(User);

    // Buscar el SuperAdministrador por RUT y rol
    const superAdmin = await userRepo.findOne({
      where: { 
        rut: "11.111.111-1",
        role: "SuperAdministrador"
      }
    });

    if (!superAdmin) {
      console.log("❌ No se encontró el Super Administrador con RUT 11.111.111-1");
      process.exit(1);
    }

    console.log(`📋 Super Administrador encontrado: "${superAdmin.name}"`);

    // Actualizar el nombre
    const nombreAnterior = superAdmin.name;
    superAdmin.name = "Super Administrador Sistema";
    superAdmin.updateAt = new Date();

    await userRepo.save(superAdmin);

    console.log(`✅ Nombre actualizado exitosamente:`);
    console.log(`   Anterior: "${nombreAnterior}"`);
    console.log(`   Nuevo: "${superAdmin.name}"`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error al actualizar el nombre del Super Administrador:", error);
    process.exit(1);
  }
}

actualizarNombreSuperAdmin(); 