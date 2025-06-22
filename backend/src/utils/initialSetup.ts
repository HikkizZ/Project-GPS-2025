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
            // 1. Eliminar fichas de empresa del admin
            await transactionalEntityManager.query(
                'DELETE FROM "fichas_empresa" WHERE "trabajadorId" IN (SELECT id FROM trabajadores WHERE rut = $1 OR "correoPersonal" = $2)',
                ["11111111-1", "admin.principal@gmail.com"]
            );

            // 2. Eliminar todos los registros de userauth relacionados con el rut del admin
            await transactionalEntityManager.query(
                'DELETE FROM "user" WHERE "rut" = $1',
                ["11111111-1"]
            );

            // 3. Eliminar usuario admin
            await transactionalEntityManager.query(
                'DELETE FROM "user" WHERE "rut" = $1',
                ["11111111-1"]
            );

            // 4. Eliminar trabajador admin
            await transactionalEntityManager.query(
                'DELETE FROM "trabajadores" WHERE "rut" = $1 OR "correoPersonal" = $2',
                ["11111111-1", "admin.principal@gmail.com"]
            );
        });

        // 5. Crear o actualizar el trabajador superadmin ficticio
        // Establecer fecha de ingreso en zona horaria de Chile
        process.env.TZ = 'America/Santiago';
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        
        let superAdminTrabajador = await trabajadorRepo.findOne({ where: { rut: "11.111.111-1" } });
        if (superAdminTrabajador) {
            superAdminTrabajador.nombres = "Super";
            superAdminTrabajador.apellidoPaterno = "Administrador";
            superAdminTrabajador.apellidoMaterno = "Técnico";
            superAdminTrabajador.fechaNacimiento = new Date("1990-01-01");
            superAdminTrabajador.telefono = "+56911111111";
            superAdminTrabajador.correoPersonal = "superadmin@gmail.com";
            superAdminTrabajador.numeroEmergencia = "+56922222222";
            superAdminTrabajador.direccion = "Oficina Central 123";
            superAdminTrabajador.fechaIngreso = new Date(`${year}-${month}-${day}T12:00:00`);
            superAdminTrabajador.enSistema = true;
            await trabajadorRepo.save(superAdminTrabajador);
        } else {
            superAdminTrabajador = trabajadorRepo.create({
                rut: "11.111.111-1",
                nombres: "Super",
                apellidoPaterno: "Administrador",
                apellidoMaterno: "Técnico",
                fechaNacimiento: new Date("1990-01-01"),
                telefono: "+56911111111",
                correoPersonal: "superadmin@gmail.com",
                numeroEmergencia: "+56922222222",
                direccion: "Oficina Central 123",
                fechaIngreso: new Date(`${year}-${month}-${day}T12:00:00`),
                enSistema: true
            });
            await trabajadorRepo.save(superAdminTrabajador);
        }

        // 6. Crear o actualizar el usuario superadmin ficticio
        let superAdminUser = await userRepo.findOne({ where: { rut: "11.111.111-1" } });
        const superAdminPlainPassword = "204_M1n8";
        const superAdminHashedPassword = await encryptPassword(superAdminPlainPassword);
        if (superAdminUser) {
            superAdminUser.name = "Super Administrador Técnico";
            superAdminUser.email = "super.administrador@lamas.com";
            superAdminUser.password = superAdminHashedPassword;
            superAdminUser.role = 'SuperAdministrador' as userRole;
            superAdminUser.estadoCuenta = "Activa";
            await userRepo.save(superAdminUser);
        } else {
            superAdminUser = userRepo.create({
                name: "Super Administrador Técnico",
                email: "super.administrador@lamas.com",
                password: superAdminHashedPassword,
                role: 'SuperAdministrador' as userRole,
                rut: "11.111.111-1",
                estadoCuenta: "Activa"
            });
            await userRepo.save(superAdminUser);
        }

        // 7. Crear o actualizar ficha de empresa superadmin ficticio
        let fichaSuperAdmin = await fichaEmpresaRepo.findOne({ where: { trabajador: { rut: "11.111.111-1" } }, relations: ["trabajador"] });
        if (fichaSuperAdmin) {
            fichaSuperAdmin.cargo = "Superadministrador Técnico";
            fichaSuperAdmin.area = "TI";
            fichaSuperAdmin.tipoContrato = "Indefinido";
            fichaSuperAdmin.jornadaLaboral = "Completa";
            fichaSuperAdmin.sueldoBase = 4000000;
            fichaSuperAdmin.trabajador = superAdminTrabajador;
            fichaSuperAdmin.estado = EstadoLaboral.ACTIVO;
            fichaSuperAdmin.fechaInicioContrato = new Date(`${year}-${month}-${day}T12:00:00`);
            fichaSuperAdmin.contratoURL = null;
            await fichaEmpresaRepo.save(fichaSuperAdmin);
        } else {
            fichaSuperAdmin = fichaEmpresaRepo.create({
                cargo: "Superadministrador Técnico",
                area: "TI",
                tipoContrato: "Indefinido",
                jornadaLaboral: "Completa",
                sueldoBase: 4000000,
                trabajador: superAdminTrabajador,
                estado: EstadoLaboral.ACTIVO,
                fechaInicioContrato: new Date(`${year}-${month}-${day}T12:00:00`),
                contratoURL: null
            });
            await fichaEmpresaRepo.save(fichaSuperAdmin);
        }

        console.log("✅ Configuración inicial completada");
    } catch (error) {
        console.error("❌ Error en la configuración inicial:", error);
        throw error;
    }
}