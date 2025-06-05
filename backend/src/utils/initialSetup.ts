import { AppDataSource } from "../config/configDB.js";
import { User } from "../entity/user.entity.js";
import { Trabajador } from "../entity/recursosHumanos/trabajador.entity.js";
import { FichaEmpresa, EstadoLaboral } from "../entity/recursosHumanos/fichaEmpresa.entity.js";
import { encryptPassword } from "../utils/encrypt.js";
import { userRole } from "../types/auth.types.js";

export async function initialSetup(): Promise<void> {
    try {
        console.log("=> Iniciando configuración inicial");

        const userRepo = AppDataSource.getRepository(User);
        const trabajadorRepo = AppDataSource.getRepository(Trabajador);
        const fichaEmpresaRepo = AppDataSource.getRepository(FichaEmpresa);

        await AppDataSource.transaction(async transactionalEntityManager => {
            console.log("=> Iniciando proceso de eliminación en transacción...");

            // 1. Eliminar fichas de empresa del admin
            console.log("=> Eliminando fichas de empresa del admin...");
            await transactionalEntityManager.query(
                'DELETE FROM "fichas_empresa" WHERE "trabajadorId" IN (SELECT id FROM trabajadores WHERE rut = $1 OR correo = $2)',
                ["11111111-1", "admin.principal@gmail.com"]
            );
            console.log("✅ Fichas de empresa eliminadas");

            // 2. Eliminar todos los registros de userauth relacionados con el rut del admin
            console.log("=> Eliminando TODOS los registros de userauth del admin por rut...");
            await transactionalEntityManager.query(
                'DELETE FROM "userauth" WHERE "rut" = $1',
                ["11111111-1"]
            );
            console.log("✅ Registros de userauth eliminados");

            // 3. Eliminar usuario admin
            console.log("=> Eliminando usuario admin...");
            await transactionalEntityManager.query(
                'DELETE FROM "user" WHERE "rut" = $1',
                ["11111111-1"]
            );
            console.log("✅ Usuario admin eliminado");

            // 4. Eliminar trabajador admin
            console.log("=> Eliminando trabajador admin...");
            await transactionalEntityManager.query(
                'DELETE FROM "trabajadores" WHERE "rut" = $1 OR "correo" = $2',
                ["11111111-1", "admin.principal@gmail.com"]
            );
            console.log("✅ Trabajador admin eliminado");
        });

        // 5. Crear el trabajador admin
        console.log("=> Creando trabajador admin...");
        const adminTrabajador = trabajadorRepo.create({
            rut: "11111111-1",
            nombres: "Administrador",
            apellidoPaterno: "Principal",
            apellidoMaterno: "Sistema",
            fechaNacimiento: new Date("1990-01-01"),
            telefono: "+56911111111",
            correo: "admin.principal@gmail.com",
            numeroEmergencia: "+56911111111",
            direccion: "Dirección Principal 123",
            fechaIngreso: new Date(),
            enSistema: true
        });
        await trabajadorRepo.save(adminTrabajador);
        console.log("✅ Trabajador admin creado con RUT: 11111111-1");

        // 6. Crear el usuario admin
        console.log("=> Creando usuario admin...");
        const adminPlainPassword = "204dm1n8";
        const hashedPassword = await encryptPassword(adminPlainPassword);
        const adminUser = userRepo.create({
            name: "Administrador",
            email: "admin.principal@gmail.com",
            password: hashedPassword,
            role: userRole.Administrador,
            rut: "11111111-1",
            estadoCuenta: "Activa"
        });
        await userRepo.save(adminUser);
        console.log("✅ Usuario admin creado exitosamente");

        // 7. Crear ficha de empresa admin
        console.log("=> Creando ficha de empresa admin...");
        const fichaAdmin = fichaEmpresaRepo.create({
            cargo: "Administrador Principal",
            area: "Administración",
            empresa: "GPS",
            tipoContrato: "Indefinido",
            jornadaLaboral: "Completa",
            sueldoBase: 2000000,
            trabajador: adminTrabajador,
            estado: EstadoLaboral.ACTIVO,
            fechaInicioContrato: new Date(),
            contratoURL: null
        });
        await fichaEmpresaRepo.save(fichaAdmin);
        console.log("✅ Ficha de empresa admin creada");

        console.log("✅ Configuración inicial completada con éxito");
    } catch (error) {
        console.error("❌ Error en la configuración inicial:", error);
        throw error;
    }
}