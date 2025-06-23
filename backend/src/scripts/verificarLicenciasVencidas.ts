import { AppDataSource } from "../config/configDB.js";
import { verificarLicenciasVencidasService } from "../services/recursosHumanos/licenciaPermiso.service.js";
import cron from "node-cron";

async function iniciarVerificacionLicencias() {
  try {
    // Inicializar la conexión a la base de datos
    await AppDataSource.initialize();
    console.log("✅ Conexión a la base de datos establecida");

    // Programar la tarea para que se ejecute todos los días a las 00:01
    cron.schedule("1 0 * * *", async () => {
      console.log("🔍 Iniciando verificación de licencias vencidas...");
      
      try {
        const [actualizaciones, error] = await verificarLicenciasVencidasService();
        
        if (error) {
          console.error("❌ Error al verificar licencias:", error);
          return;
        }

        console.log(`✅ Verificación completada. ${actualizaciones} estados actualizados a Activo`);
      } catch (error) {
        console.error("❌ Error inesperado durante la verificación:", error);
      }
    });

    console.log("✅ Tarea programada correctamente");
  } catch (error) {
    console.error("❌ Error al inicializar el servicio:", error);
    process.exit(1);
  }
}

iniciarVerificacionLicencias(); 