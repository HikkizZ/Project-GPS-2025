import { AppDataSource } from "../config/configDB.js";
import { User } from "../entity/user.entity.js";
import { Trabajador } from "../entity/recursosHumanos/trabajador.entity.js";
import { FichaEmpresa } from "../entity/recursosHumanos/fichaEmpresa.entity.js";
import { HistorialLaboral } from "../entity/recursosHumanos/historialLaboral.entity.js";
import { LicenciaPermiso } from "../entity/recursosHumanos/licenciaPermiso.entity.js";
import { AsignarBono } from "../entity/recursosHumanos/Remuneraciones/asignarBono.entity.js";

async function limpiarBaseDatos() {
    try {
        await AppDataSource.initialize();
        console.log("🔌 Conexión a la base de datos establecida");

        const userRepo = AppDataSource.getRepository(User);
        const trabajadorRepo = AppDataSource.getRepository(Trabajador);
        const fichaEmpresaRepo = AppDataSource.getRepository(FichaEmpresa);
        const historialLaboralRepo = AppDataSource.getRepository(HistorialLaboral);
        const licenciaPermisoRepo = AppDataSource.getRepository(LicenciaPermiso);
        const asignarBonoRepo = AppDataSource.getRepository(AsignarBono);

        // 1. Primero eliminar licencias y permisos (dependen de trabajador)
        console.log("🔄 Eliminando licencias y permisos...");
        const licencias = await licenciaPermisoRepo.find();
        await licenciaPermisoRepo.remove(licencias);
        console.log(`🗑️ ${licencias.length} licencias/permisos eliminados`);

        // 2. Eliminar historial laboral (depende de trabajador)
        console.log("🔄 Eliminando historial laboral...");
        const historiales = await historialLaboralRepo.find();
        await historialLaboralRepo.remove(historiales);
        console.log(`🗑️ ${historiales.length} historiales eliminados`);

        // 3. Eliminar asignaciones de bonos (dependen de ficha de empresa)
        console.log("🔄 Eliminando asignaciones de bonos...");
        const asignacionesBonos = await asignarBonoRepo.find();
        await asignarBonoRepo.remove(asignacionesBonos);
        console.log(`🗑️ ${asignacionesBonos.length} asignaciones de bonos eliminadas`);

        // 4. Eliminar fichas de empresa (dependen de trabajador)
        console.log("🔄 Eliminando fichas de empresa...");
        const fichas = await fichaEmpresaRepo.find();
        await fichaEmpresaRepo.remove(fichas);
        console.log(`🗑️ ${fichas.length} fichas eliminadas`);

        // 5. Eliminar usuarios (excepto SuperAdministrador)
        console.log("🔄 Eliminando usuarios (excepto SuperAdministrador)...");
        const users = await userRepo
            .createQueryBuilder("user")
            .where("user.role != :role", { role: "SuperAdministrador" })
            .getMany();
        await userRepo.remove(users);
        console.log(`🗑️ ${users.length} usuarios eliminados`);

        // 6. Finalmente eliminar trabajadores
        console.log("🔄 Eliminando trabajadores...");
        const trabajadores = await trabajadorRepo.find();
        await trabajadorRepo.remove(trabajadores);
        console.log(`🗑️ ${trabajadores.length} trabajadores eliminados`);

        // Verificar SuperAdmin preservado
        const superAdmin = await userRepo.findOne({
            where: { role: "SuperAdministrador" }
        });
        console.log(`📋 Usuario preservado: SuperAdministrador (${superAdmin?.corporateEmail})`);

        console.log("✅ Base de datos limpiada exitosamente");
    } catch (error) {
        console.error("❌ Error al limpiar la base de datos:", error);
    } finally {
        await AppDataSource.destroy();
        console.log("🔌 Conexión a la base de datos cerrada");
    }
}

limpiarBaseDatos(); 