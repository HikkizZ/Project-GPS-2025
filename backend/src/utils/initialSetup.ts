import { AppDataSource } from "../config/configDB.js";
import { User } from "../entity/user.entity.js";
import { encryptPassword } from "../utils/encrypt.js";
import { userRole } from "../../types.d.js";

// Determinar el entorno
const isProduction = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";
const isDevelopment = !isProduction && !isTest;

export async function initialSetup(): Promise<void> {
    try {
        const userRepo = AppDataSource.getRepository(User);

        // Verificar si ya existe un SuperAdmin
        const existingSuperAdmin = await userRepo.findOne({
            where: { role: 'SuperAdministrador' }
        });

        if (!existingSuperAdmin) {
            // Crear ÚNICAMENTE el usuario superadmin (sin RUT)
            const superAdminPlainPassword = "204_M1n8";
            const superAdminHashedPassword = await encryptPassword(superAdminPlainPassword);
            
            const superAdminUser = userRepo.create({
                name: "Super Administrador Sistema",
                email: "super.administrador@lamas.com",
                password: superAdminHashedPassword,
                role: 'SuperAdministrador' as userRole,
                rut: null,
                estadoCuenta: "Activa"
            });
            await userRepo.save(superAdminUser);
            console.log("✅ Configuración inicial completada - SuperAdmin creado como usuario únicamente");
        } else {
            console.log("✅ Configuración inicial completada - SuperAdmin ya existe");
        }
    } catch (error) {
        console.error("❌ Error en la configuración inicial:", error);
        throw error;
    }
}