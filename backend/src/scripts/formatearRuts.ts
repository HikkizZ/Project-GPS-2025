import { AppDataSource } from "../config/configDB.js";
import { Trabajador } from "../entity/recursosHumanos/trabajador.entity.js";
import { User } from "../entity/user.entity.js";
import { formatRut } from "../helpers/rut.helper.js";

async function formatearRuts() {
  try {
    console.log("🔧 Iniciando formateo de RUTs en la base de datos...");
    
    // Inicializar conexión
    await AppDataSource.initialize();
    console.log("✅ Conexión a la base de datos establecida");

    // Obtener todos los trabajadores
    const trabajadorRepository = AppDataSource.getRepository(Trabajador);
    const trabajadores = await trabajadorRepository.find();
    
    console.log(`📋 Encontrados ${trabajadores.length} trabajadores para actualizar`);

    // Actualizar RUTs de trabajadores
    for (const trabajador of trabajadores) {
      const rutFormateado = formatRut(trabajador.rut);
      if (rutFormateado !== trabajador.rut) {
        console.log(`🔄 Actualizando RUT trabajador: ${trabajador.rut} → ${rutFormateado}`);
        await trabajadorRepository
          .createQueryBuilder()
          .update()
          .set({ rut: rutFormateado })
          .where("id = :id", { id: trabajador.id })
          .execute();
      }
    }

    // Obtener todos los usuarios
    const userRepository = AppDataSource.getRepository(User);
    const users = await userRepository.find();
    
    console.log(`👥 Encontrados ${users.length} usuarios para actualizar`);

    // Formatear RUT de usuarios
    for (const user of users) {
        if (user.rut) {  // Solo formatear si el RUT existe
            const rutFormateado = formatRut(user.rut);
            if (rutFormateado !== user.rut) {
                await userRepository.update(user.id, { rut: rutFormateado });
                console.log(`Usuario ${user.id}: RUT actualizado de ${user.rut} a ${rutFormateado}`);
            }
        }
    }

    console.log("✅ Formateo de RUTs completado exitosamente");
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error al formatear RUTs:", error);
    await AppDataSource.destroy();
    process.exit(1);
  }
}

formatearRuts(); 