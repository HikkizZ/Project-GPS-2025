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

        // Buscar usuario admin existente
        console.log("=> Verificando usuario admin existente...");
        const adminUser = await userRepo.findOne({
            where: { email: "admin.principal@gmail.com" }
        });

        if (adminUser) {
            console.log("=> Usuario admin encontrado, actualizando estado...");
            // Si existe, asegurarse de que esté activo
            adminUser.estadoCuenta = "Activa";
            await userRepo.save(adminUser);
            return;
        }

        // Si no existe, crear el usuario admin
        console.log("=> Creando usuario admin...");
        const hashedPassword = await encryptPassword("admin123");
        const newAdmin = userRepo.create({
            name: "Administrador Principal",
            rut: "11.111.111-1",
            email: "admin.principal@gmail.com",
            password: hashedPassword,
            role: "Administrador",
            estadoCuenta: "Activa"
        });

        await userRepo.save(newAdmin);
        console.log("✅ Usuario admin creado exitosamente");

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
        console.log("✅ Trabajador admin creado con RUT:", "11.111.111-1");

        // Actualizar la referencia en el trabajador
        savedTrabajador.usuario = newAdmin;
        await trabajadorRepo.save(savedTrabajador);

        console.log("✅ Configuración inicial completada con éxito");
    } catch (error) {
        console.error("❌ Error en la configuración inicial:", error);
        throw error;
    }
}