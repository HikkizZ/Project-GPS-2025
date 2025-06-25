import { AppDataSource } from "../config/configDB.js";
import { User } from "../entity/user.entity.js";
import { Trabajador } from "../entity/recursosHumanos/trabajador.entity.js";
import { FichaEmpresa, EstadoLaboral } from "../entity/recursosHumanos/fichaEmpresa.entity.js";
import { encryptPassword } from "../utils/encrypt.js";
import { userRole } from "../../types.d.js";

// Determinar el entorno
const isProduction = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";
const isDevelopment = !isProduction && !isTest;

export async function initialSetup(): Promise<void> {
    try {
        const userRepo = AppDataSource.getRepository(User);
        const trabajadorRepo = AppDataSource.getRepository(Trabajador);
        const fichaEmpresaRepo = AppDataSource.getRepository(FichaEmpresa);

        await AppDataSource.transaction(async transactionalEntityManager => {
            // 1. Eliminar fichas de empresa del superadmin (si existieran)
            await transactionalEntityManager.query(
                'DELETE FROM "fichas_empresa" WHERE "trabajadorId" IN (SELECT id FROM trabajadores WHERE rut = $1)',
                ["11.111.111-1"]
            );

            // 2. Eliminar usuario superadmin primero (por la constraint FK)
            await transactionalEntityManager.query(
                'DELETE FROM "user" WHERE "rut" = $1',
                ["11.111.111-1"]
            );

            // 3. Eliminar trabajador superadmin (si existiera) - ahora el superadmin NO debe ser trabajador
            await transactionalEntityManager.query(
                'DELETE FROM "trabajadores" WHERE "rut" = $1',
                ["11.111.111-1"]
            );
        });

        // 4. Crear ÚNICAMENTE el usuario superadmin (SIN trabajador ni ficha)
        const superAdminPlainPassword = "204_M1n8";
        const superAdminHashedPassword = await encryptPassword(superAdminPlainPassword);
        
        const superAdminUser = userRepo.create({
            name: "Super Administrador Sistema",
            email: "super.administrador@lamas.com",
            password: superAdminHashedPassword,
            role: 'SuperAdministrador' as userRole,
            rut: "11.111.111-1",
            estadoCuenta: "Activa"
        });
        await userRepo.save(superAdminUser);

        console.log("✅ Configuración inicial completada - SuperAdmin creado como usuario únicamente");
    } catch (error) {
        console.error("❌ Error en la configuración inicial:", error);
        throw error;
    }
}