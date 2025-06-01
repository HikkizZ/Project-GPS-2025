import { AppDataSource } from "../config/configDB.js";
import { User } from "../entity/user.entity.js";
import { Trabajador } from "../entity/recursosHumanos/trabajador.entity.js";
import { FichaEmpresa, EstadoLaboral } from "../entity/recursosHumanos/fichaEmpresa.entity.js";
import { encryptPassword } from "../helpers/bcrypt.helper.js";
import { userRole } from "../../types.js";

export async function initialSetup(): Promise<void> {
    try {
        console.log("=> Iniciando configuración inicial");

        const userRepo = AppDataSource.getRepository(User);
        const trabajadorRepo = AppDataSource.getRepository(Trabajador);
        const fichaEmpresaRepo = AppDataSource.getRepository(FichaEmpresa);

        let adminUser: User | null = null;
        let adminTrabajador: Trabajador | null = null;

        // Buscar usuario admin existente
        console.log("=> Verificando usuario admin existente...");
        adminUser = await userRepo.findOne({
            where: { email: "admin.principal@gmail.com" }
        });

        if (adminUser) {
            console.log("=> Usuario admin encontrado, actualizando estado...");
            // Si existe, asegurarse de que esté activo
            adminUser.estadoCuenta = "Activa";
            await userRepo.save(adminUser);

            // Buscar el trabajador asociado
            adminTrabajador = await trabajadorRepo.findOne({
                where: { rut: "11.111.111-1" }
            });
        } else {
            // Si no existe, crear el usuario admin
            console.log("=> Creando usuario admin...");
            const hashedPassword = await encryptPassword("admin123");
            adminUser = userRepo.create({
                name: "Administrador Principal",
                rut: "11.111.111-1",
                email: "admin.principal@gmail.com",
                password: hashedPassword,
                role: "Administrador",
                estadoCuenta: "Activa"
            });

            await userRepo.save(adminUser);
            console.log("✅ Usuario admin creado exitosamente");

            // Crear el trabajador admin
            console.log("=> Creando trabajador admin...");
            adminTrabajador = trabajadorRepo.create({
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

            adminTrabajador = await trabajadorRepo.save(adminTrabajador);
            console.log("✅ Trabajador admin creado con RUT:", "11.111.111-1");

            // Actualizar la referencia en el trabajador
            adminTrabajador.usuario = adminUser;
            await trabajadorRepo.save(adminTrabajador);
        }

        // Verificar si ya existe la ficha de empresa del admin
        console.log("=> Verificando ficha de empresa del admin...");
        const fichaAdminExistente = await fichaEmpresaRepo.findOne({
            where: { trabajador: { rut: "11.111.111-1" } },
            relations: ["trabajador"]
        });

        if (!fichaAdminExistente && adminTrabajador) {
            // Crear la ficha de empresa del admin
            console.log("=> Creando ficha de empresa para admin...");
            const fichaAdmin = fichaEmpresaRepo.create({
                trabajador: adminTrabajador,
                cargo: "Administrador Principal",
                area: "Administración",
                empresa: "GPS 2025",
                tipoContrato: "Indefinido",
                jornadaLaboral: "Completa",
                sueldoBase: 2500000, // Sueldo base ejemplo
                fechaInicioContrato: new Date(),
                estado: EstadoLaboral.ACTIVO
            });

            await fichaEmpresaRepo.save(fichaAdmin);
            console.log("✅ Ficha de empresa del admin creada exitosamente");
        } else {
            console.log("=> Ficha de empresa del admin ya existe");
        }

        console.log("✅ Configuración inicial completada con éxito");
    } catch (error) {
        console.error("❌ Error en la configuración inicial:", error);
        throw error;
    }
}