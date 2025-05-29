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

        // Verificar si ya existe el trabajador admin
        const trabajadorExists = await trabajadorRepo.findOne({
            where: { rut: "11.111.111-1" }
        });

        if (trabajadorExists) {
            console.log("✅ El trabajador admin ya existe");
            
            // Verificar si existe el usuario admin
            const adminExists = await userRepo.findOne({
                where: { rut: trabajadorExists.rut }
            });

            if (adminExists) {
                console.log("✅ El usuario admin ya existe");
                return;
            }

            // Si existe el trabajador pero no el usuario, crear solo el usuario
            const hashedPassword = await encryptPassword("Admin2024");
            const userAdmin = userRepo.create({
                name: "Administrador Principal",
                rut: trabajadorExists.rut,
                email: trabajadorExists.correo,
                password: hashedPassword,
                role: "Administrador" as userRole
            });

            await userRepo.save(userAdmin);
            console.log("✅ Usuario admin creado");
            return;
        }

        // Crear el trabajador admin
        console.log("=> Creando trabajador admin...");
        const trabajadorAdmin = trabajadorRepo.create({
            rut: "11.111.111-1",
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

        const savedTrabajador = await trabajadorRepo.save(trabajadorAdmin);
        console.log("✅ Trabajador admin creado con RUT:", savedTrabajador.rut);

        // Crear el usuario admin
        console.log("=> Creando usuario admin...");
        const hashedPassword = await encryptPassword("Admin2024");
        const userAdmin = userRepo.create({
            name: "Administrador Principal",
            rut: savedTrabajador.rut,
            email: savedTrabajador.correo,
            password: hashedPassword,
            role: "Administrador" as userRole
        });

        const savedUser = await userRepo.save(userAdmin);
        console.log("✅ Usuario admin creado con RUT:", savedUser.rut);

        console.log("✅ Configuración inicial completada con éxito");
    } catch (error) {
        console.error("❌ Error en la configuración inicial:", error);
        throw error;
    }
}