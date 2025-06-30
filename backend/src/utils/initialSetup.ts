import { AppDataSource } from "../config/configDB.js";
import { User } from "../entity/user.entity.js";
import { encryptPassword } from "../utils/encrypt.js";
import { Bono, temporalidad, tipoBono } from "../entity/recursosHumanos/Remuneraciones/Bono.entity.js";
import { PrevisionAFP, TipoFondoAFP } from "../entity/recursosHumanos/Remuneraciones/previsionAFP.entity.js";
import { PrevisionSalud, TipoPrevisionSalud } from "../entity/recursosHumanos/Remuneraciones/previsionSalud.entity.js";
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
        const bonosRepo = AppDataSource.getRepository(Bono);
        const afpRepo = AppDataSource.getRepository(PrevisionAFP);

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
                'DELETE FROM "user" WHERE "rut" = $1',
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
            role: 'Administrador',
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

        // 8. Creacion de bonos predefinidos
        console.log("=> Creando bonos predefinidos...");
        const bono1 = bonosRepo.create({           
            nombreBono: "Bono de Productividad",
            monto: 80000,
            tipoBono: tipoBono.empresarial,
            temporalidad: temporalidad.recurrente,
            descripcion: "Se entrega mensualmente a trabajadores que cumplan metas de productividad.",
            imponible: true
        });

        const bono2 = bonosRepo.create({ 
            nombreBono: "Bono de Fiestas Patrias",
            monto: 60000,
            tipoBono: tipoBono.empresarial,
            temporalidad: temporalidad.puntual,
            descripcion: "Bono otorgado en septiembre para celebrar las Fiestas Patrias.",
            imponible: true
         });

        const bono3 = bonosRepo.create({ 
            nombreBono: "Bono de Escolaridad",
            monto: 25000,
            tipoBono: tipoBono.empresarial,
            temporalidad: temporalidad.puntual,
            descripcion: "Bono anual entregado por la empresa a trabajadores con hijos en edad escolar.",
            imponible: false
         });

        const bono4 = bonosRepo.create({ 
            nombreBono: "Bono por Puntualidad",
            monto: 15000,
            tipoBono: tipoBono.empresarial,
            temporalidad: temporalidad.recurrente,
            descripcion: "Bono mensual entregado a trabajadores sin atrasos o inasistencias.",
            imponible: true
         });

        const bono5 = bonosRepo.create({ 
            nombreBono: "Subsidio al Empleo Joven",
            monto: 40000,
            tipoBono: tipoBono.estatal,
            temporalidad: temporalidad.recurrente,
            descripcion: "Bono entregado por el Estado para incentivar la contratación de jóvenes trabajadores.",
            imponible: false
         });

        const bono6 = bonosRepo.create({ 
            nombreBono: "Bono Mujer Trabajadora",
            monto: 40000,
            tipoBono: tipoBono.estatal,
            temporalidad: temporalidad.recurrente,
            descripcion: "Aporte estatal para mujeres trabajadoras de entre 25 y 59 años pertenecientes al 40% más vulnerable.",
            imponible: false
         });

        const bono7 = bonosRepo.create({ 
            nombreBono: "Bono Zona Extrema",
            monto: 30000,
            tipoBono: tipoBono.estatal,
            temporalidad: temporalidad.permanente,
            descripcion: "Bono por trabajar en zonas geográficas extremas de Chile.",
            imponible: true
         });

        const bono8 = bonosRepo.create({ 
            nombreBono: "Bono Escolaridad Estatal",
            monto: 25000,
            tipoBono: tipoBono.estatal,
            temporalidad: temporalidad.puntual,
            descripcion: "Aporte anual del Estado por carga escolar del trabajador.",
            imponible: false
         });

        await bonosRepo.save([bono1, bono2, bono3, bono4, bono5, bono6, bono7, bono8]);
        console.log("✅ Bonos predefinidos creados exitosamente");

         // 9. Creacion de Configuración AFP
        console.log("=> Creando configuración AFP...");
        
        const AFP_A = afpRepo.create({
            tipo: TipoFondoAFP.A,
            comision: 0.01 // 1% de comisión
        });

        const AFP_B = afpRepo.create({
            tipo: TipoFondoAFP.B,
            comision: 0.015 // 1.5% de comisión
        });

        const AFP_C = afpRepo.create({
            tipo: TipoFondoAFP.C,
            comision: 0.02 // 2% de comisión
        });
        
        const AFP_D = afpRepo.create({
            tipo: TipoFondoAFP.D,
            comision: 0.025 // 2.5% de comisión
        });

        const AFP_E = afpRepo.create({
            tipo: TipoFondoAFP.E,
            comision: 0.03 // 3% de comisión
        });

        await afpRepo.save([AFP_A, AFP_B, AFP_C, AFP_D, AFP_E]);
        console.log("✅ Configuración AFP creada exitosamente");
        
         // 10. Creación de Configuración previsión salud

        console.log("=> Creando configuración de previsión salud...");
        const saludFONASA = AppDataSource.getRepository(PrevisionSalud).create({
            tipo: TipoPrevisionSalud.FONASA,
            comision: 0.07 // 7% de comisión
        });

        const saludISAPRE = AppDataSource.getRepository(PrevisionSalud).create({
            tipo: TipoPrevisionSalud.ISAPRE,
            comision: 0.08 // 8% de comisión
        });

        await AppDataSource.getRepository(PrevisionSalud).save([saludFONASA, saludISAPRE]);
        console.log("✅ Configuración de previsión salud creada exitosamente");

        console.log("✅ Configuración inicial completada con éxito");

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