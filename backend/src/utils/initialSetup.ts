import { AppDataSource } from "../config/configDB.js";
import { User } from "../entity/user.entity.js";
import { Trabajador } from "../entity/recursosHumanos/trabajador.entity.js";
import { encryptPassword } from "../helpers/bcrypt.helper.js";
import { userRole } from "../../types.js";

export async function initialSetup(): Promise<void> {
    try {
        console.log("=> Iniciando configuración inicial");

        const userRepo = AppDataSource.getRepository(User);
        const trabajadorRepo = AppDataSource.getRepository(Trabajador);

        // Crear trabajador y usuario admin si no existen
        const adminRut = "11.111.111-1";
        const trabajadorAdminExists = await trabajadorRepo.findOne({
            where: { rut: adminRut }
        });

        if (!trabajadorAdminExists) {
            // Crear el trabajador admin
            console.log("=> Creando trabajador admin...");
            const trabajadorAdmin = trabajadorRepo.create({
                rut: adminRut,
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

            await trabajadorRepo.save(trabajadorAdmin);
            console.log("✅ Trabajador admin creado con RUT:", adminRut);

            // Crear el usuario admin
            const hashedAdminPassword = await encryptPassword("Admin2024");
            const userAdmin = userRepo.create({
                name: "Administrador Principal",
                rut: adminRut,
                email: "admin.principal@gmail.com",
                password: hashedAdminPassword,
                role: "Administrador" as userRole
            });

            await userRepo.save(userAdmin);
            console.log("✅ Usuario admin creado con RUT:", adminRut);
        } else {
            console.log("✅ El trabajador y usuario admin ya existen");
        }

        // Crear trabajador y usuario RRHH si no existen
        const rrhhRut = "22.222.222-2";
        const trabajadorRRHHExists = await trabajadorRepo.findOne({
            where: { rut: rrhhRut }
        });

        if (!trabajadorRRHHExists) {
            // Crear el trabajador RRHH
            console.log("=> Creando trabajador RRHH...");
            const trabajadorRRHH = trabajadorRepo.create({
                rut: rrhhRut,
                nombres: "Recursos",
                apellidoPaterno: "Humanos",
                apellidoMaterno: "Principal",
                fechaNacimiento: new Date("1990-01-01"),
                telefono: "+56922222222",
                correo: "recursoshumanos@gmail.com",
                numeroEmergencia: "+56922222222",
                direccion: "Dirección RRHH 123",
                fechaIngreso: new Date(),
                enSistema: true
            });

            await trabajadorRepo.save(trabajadorRRHH);
            console.log("✅ Trabajador RRHH creado con RUT:", rrhhRut);

            // Crear el usuario RRHH
            console.log("=> Creando usuario RRHH...");
            const hashedRRHHPassword = await encryptPassword("RRHH2024");
            const userRRHH = userRepo.create({
                name: "Recursos Humanos Principal",
                rut: rrhhRut,
                email: "recursoshumanos@gmail.com",
                password: hashedRRHHPassword,
                role: "RecursosHumanos" as userRole
            });

            await userRepo.save(userRRHH);
            console.log("✅ Usuario RRHH creado:", {
                email: userRRHH.email,
                role: userRRHH.role,
                rut: userRRHH.rut
            });
        } else {
            // Verificar si existe el usuario RRHH
            const userRRHHExists = await userRepo.findOne({
                where: { rut: rrhhRut }
            });

            if (!userRRHHExists) {
                console.log("=> Creando usuario RRHH (trabajador ya existe)...");
                const hashedRRHHPassword = await encryptPassword("RRHH2024");
                const userRRHH = userRepo.create({
                    name: "Recursos Humanos Principal",
                    rut: rrhhRut,
                    email: "recursoshumanos@gmail.com",
                    password: hashedRRHHPassword,
                    role: "RecursosHumanos" as userRole
                });

                await userRepo.save(userRRHH);
                console.log("✅ Usuario RRHH creado:", {
                    email: userRRHH.email,
                    role: userRRHH.role,
                    rut: userRRHH.rut
                });
            } else {
                console.log("✅ Usuario RRHH ya existe:", {
                    email: userRRHHExists.email,
                    role: userRRHHExists.role,
                    rut: userRRHHExists.rut
                });
            }
        }

        console.log("✅ Configuración inicial completada con éxito");
    } catch (error) {
        console.error("❌ Error en la configuración inicial:", error);
        throw error;
    }
}