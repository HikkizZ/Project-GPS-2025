import { AppDataSource } from "../config/configDB.js";
import { User } from "../entity/user.entity.js";
import { encryptPassword } from "../utils/encrypt.js";
import { Bono, temporalidad, tipoBono } from "../entity/recursosHumanos/Remuneraciones/Bono.entity.js";
import { PrevisionAFP, TipoFondoAFP } from "../entity/recursosHumanos/Remuneraciones/previsionAFP.entity.js";
import { PrevisionSalud, TipoPrevisionSalud } from "../entity/recursosHumanos/Remuneraciones/previsionSalud.entity.js";
import { userRole } from "../../types.d.js";
//import { Trabajador } from  "../entity/recursosHumanos/trabajador.entity.js";
//import { FichaEmpresa, EstadoLaboral } from "../entity/recursosHumanos/fichaEmpresa.entity.js";
//import { cp } from "fs";

// Determinar el entorno
const isProduction = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";
//const isDevelopment = !isProduction && !isTest;

export async function initialSetup(): Promise<void> {
    try {
        const userRepo = AppDataSource.getRepository(User);
        const bonosRepo = AppDataSource.getRepository(Bono);
        const afpRepo = AppDataSource.getRepository(PrevisionAFP);
        const saludRepo = AppDataSource.getRepository(PrevisionSalud);
        
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
                corporateEmail: "super.administrador@lamas.com",
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
        /**
         * // 8. Creacion de bonos predefinidos
        console.log("=> Creando bonos predefinidos...");
        const bono1 = bonosRepo.create({           
            nombreBono: "Bono de Productividad",
            monto: "80.000",
            tipoBono: tipoBono.empresarial,
            temporalidad: temporalidad.recurrente,
            descripcion: "Se entrega mensualmente a trabajadores que cumplan metas de productividad.",
            imponible: true
        });

        const bono2 = bonosRepo.create({ 
            nombreBono: "Bono de Fiestas Patrias",
            monto: "60.000",
            tipoBono: tipoBono.empresarial,
            temporalidad: temporalidad.puntual,
            descripcion: "Bono otorgado en septiembre para celebrar las Fiestas Patrias.",
            imponible: true
         });

        const bono3 = bonosRepo.create({ 
            nombreBono: "Bono de Escolaridad",
            monto: "25.000",
            tipoBono: tipoBono.empresarial,
            temporalidad: temporalidad.puntual,
            descripcion: "Bono anual entregado por la empresa a trabajadores con hijos en edad escolar.",
            imponible: false
         });

        const bono4 = bonosRepo.create({ 
            nombreBono: "Bono por Puntualidad",
            monto: "15.000",
            tipoBono: tipoBono.empresarial,
            temporalidad: temporalidad.recurrente,
            descripcion: "Bono mensual entregado a trabajadores sin atrasos o inasistencias.",
            imponible: true
         });

        const bono5 = bonosRepo.create({ 
            nombreBono: "Subsidio al Empleo Joven",
            monto: "40.000",
            tipoBono: tipoBono.estatal,
            temporalidad: temporalidad.recurrente,
            descripcion: "Bono entregado por el Estado para incentivar la contratación de jóvenes trabajadores.",
            imponible: false
         });

        const bono6 = bonosRepo.create({ 
            nombreBono: "Bono Mujer Trabajadora",
            monto: "40.000",
            tipoBono: tipoBono.estatal,
            temporalidad: temporalidad.recurrente,
            descripcion: "Aporte estatal para mujeres trabajadoras de entre 25 y 59 años pertenecientes al 40% más vulnerable.",
            imponible: false
         });

        const bono7 = bonosRepo.create({ 
            nombreBono: "Bono Zona Extrema",
            monto: "30.000",
            tipoBono: tipoBono.estatal,
            temporalidad: temporalidad.permanente,
            descripcion: "Bono por trabajar en zonas geográficas extremas de Chile.",
            imponible: true
         });

        const bono8 = bonosRepo.create({ 
            nombreBono: "Bono Escolaridad Estatal",
            monto: "25.000",
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
        const saludFONASA = saludRepo.create({
            tipo: TipoPrevisionSalud.FONASA,
            comision: 0.07 // 7% de cotización
        });

        const saludISAPRE = saludRepo.create({
            tipo: TipoPrevisionSalud.ISAPRE,
            comision: 0.08 // 8% de cotización
        });

        await AppDataSource.getRepository(PrevisionSalud).save([saludFONASA, saludISAPRE]);
        console.log("✅ Configuración de previsión salud creada exitosamente");
         */
        

        
        
    } catch (error) {
        console.error("❌ Error en la configuración inicial:", error);
        throw error;
    }
}