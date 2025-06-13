import { AppDataSource } from "../config/configDB.js";
import { User } from "../entity/user.entity.js";
import { Trabajador } from "../entity/recursosHumanos/trabajador.entity.js";
import { FichaEmpresa, EstadoLaboral } from "../entity/recursosHumanos/fichaEmpresa.entity.js";
import { encryptPassword } from "../utils/encrypt.js";

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
                'DELETE FROM "fichas_empresa" WHERE "trabajadorId" IN (SELECT id FROM trabajadores WHERE rut = $1 OR "correoPersonal" = $2)',
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
                'DELETE FROM "trabajadores" WHERE "rut" = $1 OR "correoPersonal" = $2',
                ["11111111-1", "admin.principal@gmail.com"]
            );
            console.log("✅ Trabajador admin eliminado");
        });

        // 5. Crear o actualizar el trabajador admin
        console.log("=> Creando o actualizando trabajador admin...");
        let adminTrabajador = await trabajadorRepo.findOne({ where: { rut: "20.882.865-7" } });
        if (adminTrabajador) {
            adminTrabajador.nombres = "Patricia Yulihana";
            adminTrabajador.apellidoPaterno = "González";
            adminTrabajador.apellidoMaterno = "Caamaño";
            adminTrabajador.fechaNacimiento = new Date("2001-10-15");
            adminTrabajador.telefono = "+56923847562";
            adminTrabajador.correoPersonal = "equipo.sglamas@gmail.com";
            adminTrabajador.numeroEmergencia = "+56938374625";
            adminTrabajador.direccion = "Dirección Principal 123";
            adminTrabajador.fechaIngreso = new Date();
            adminTrabajador.enSistema = true;
            await trabajadorRepo.save(adminTrabajador);
            console.log("✅ Trabajador admin actualizado con RUT: 20.882.865-7");
        } else {
            adminTrabajador = trabajadorRepo.create({
                rut: "20.882.865-7",
                nombres: "Patricia Yulihana",
                apellidoPaterno: "González",
                apellidoMaterno: "Caamaño",
                fechaNacimiento: new Date("2001-10-15"),
                telefono: "+56923847562",
                correoPersonal: "equipo.sglamas@gmail.com",
                numeroEmergencia: "+56938374625",
                direccion: "Dirección Principal 123",
                fechaIngreso: new Date(),
                enSistema: true
            });
            await trabajadorRepo.save(adminTrabajador);
            console.log("✅ Trabajador admin creado con RUT: 20.882.865-7");
        }

        // 6. Crear o actualizar el usuario admin
        console.log("=> Creando o actualizando usuario admin...");
        let adminUser = await userRepo.findOne({ where: { rut: "20.882.865-7" } });
        const adminPlainPassword = "204dm1n8";
        const hashedPassword = await encryptPassword(adminPlainPassword);
        if (adminUser) {
            adminUser.name = "Patricia Yulihana González Caamaño";
            adminUser.email = "patricia.gonzalez@lamas.com";
            adminUser.password = hashedPassword;
            adminUser.role = 'SuperAdministrador';
            adminUser.estadoCuenta = "Activa";
            await userRepo.save(adminUser);
            console.log("✅ Usuario admin actualizado exitosamente");
        } else {
            adminUser = userRepo.create({
                name: "Patricia Yulihana González Caamaño",
                email: "patricia.gonzalez@lamas.com",
                password: hashedPassword,
                role: 'SuperAdministrador',
                rut: "20.882.865-7",
                estadoCuenta: "Activa"
            });
            await userRepo.save(adminUser);
            console.log("✅ Usuario admin creado exitosamente");
        }

        // 7. Crear o actualizar ficha de empresa admin
        console.log("=> Creando o actualizando ficha de empresa admin...");
        let fichaAdmin = await fichaEmpresaRepo.findOne({ where: { trabajador: { rut: "20.882.865-7" } }, relations: ["trabajador"] });
        if (fichaAdmin) {
            fichaAdmin.cargo = "Desarrollador Full Stack";
            fichaAdmin.area = "TI";
            fichaAdmin.tipoContrato = "Indefinido";
            fichaAdmin.jornadaLaboral = "Completa";
            fichaAdmin.sueldoBase = 4000000;
            fichaAdmin.trabajador = adminTrabajador;
            fichaAdmin.estado = EstadoLaboral.ACTIVO;
            fichaAdmin.fechaInicioContrato = new Date();
            fichaAdmin.contratoURL = null;
            await fichaEmpresaRepo.save(fichaAdmin);
            console.log("✅ Ficha de empresa admin actualizada");
        } else {
            fichaAdmin = fichaEmpresaRepo.create({
                cargo: "Desarrollador Full Stack",
                area: "TI",
                tipoContrato: "Indefinido",
                jornadaLaboral: "Completa",
                sueldoBase: 4000000,
                trabajador: adminTrabajador,
                estado: EstadoLaboral.ACTIVO,
                fechaInicioContrato: new Date(),
                contratoURL: null
            });
            await fichaEmpresaRepo.save(fichaAdmin);
            console.log("✅ Ficha de empresa admin creada");
        }

        console.log("✅ Configuración inicial completada con éxito");
    } catch (error) {
        console.error("❌ Error en la configuración inicial:", error);
        throw error;
    }
}