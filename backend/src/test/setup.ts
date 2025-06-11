import express, { json, urlencoded, Application } from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";

import indexRoutes from "../routes/index.routes.js";
import { cookieKey } from "../config/configEnv.js";
import { passportJWTSetup } from "../auth/passport.auth.js";
import { AppDataSource, initializeDatabase } from "../config/configDB.js";
import { initialSetup } from "../utils/initialSetup.js";
import { User } from "../entity/user.entity.js";
import { Trabajador } from "../entity/recursosHumanos/trabajador.entity.js";
import { FichaEmpresa } from "../entity/recursosHumanos/fichaEmpresa.entity.js";
import { HistorialLaboral } from "../entity/recursosHumanos/historialLaboral.entity.js";
import { LicenciaPermiso } from "../entity/recursosHumanos/licenciaPermiso.entity.js";
import { Capacitacion } from "../entity/recursosHumanos/capacitacion.entity.js";

let app: Application;
let server: any;

export async function setupTestApp(): Promise<{ app: Application; server: any }> {
    if (!app) {
        app = express();

        app.disable("x-powered-by");

        app.use(cors({
            origin: true,
            credentials: true
        }));

        app.use(urlencoded({
            extended: true,
            limit: "1mb"
        }));

        app.use(json({
            limit: "1mb"
        }));

        app.use(cookieParser());

        app.use(morgan("dev"));

        app.use(session({
            secret: cookieKey as string,
            resave: false,
            saveUninitialized: false,
            cookie: {
                secure: false,
                httpOnly: true,
                sameSite: "strict",
            }
        }));

        app.use(passport.initialize());

        app.use(passport.session());

        passportJWTSetup();

        app.use("/api", indexRoutes);

        await initialSetup();

        server = app.listen(0); // Usar puerto aleatorio para pruebas

        console.log("✅ Test server running. DB connected, initial setup done.");
    }

    return { app, server };
}

export async function closeTestApp(): Promise<void> {
    if (server) {
        await new Promise((resolve) => server.close(resolve));
    }
}

/**
 * Función para limpiar TODOS los datos de prueba de la base de datos
 * Mantiene solo al administrador (11.111.111-1)
 */
export async function cleanupAllTestData(): Promise<void> {
    try {
        console.log("🧹 Limpiando datos de prueba...");

        if (!AppDataSource.isInitialized) {
            return;
        }

        // Limpiar en orden correcto (por dependencias)
        await AppDataSource.getRepository(Capacitacion).delete({});
        await AppDataSource.getRepository(LicenciaPermiso).delete({});
        await AppDataSource.getRepository(HistorialLaboral).delete({});
        await AppDataSource.getRepository(FichaEmpresa).delete({});

        // Eliminar usuarios de prueba (excepto admin)
        await AppDataSource.getRepository(User)
            .createQueryBuilder()
            .delete()
            .where("rut NOT IN (:...ruts)", { 
                ruts: ['20.882.865-7'] 
            })
            .execute();

        // Eliminar trabajadores de prueba (excepto admin)
        await AppDataSource.getRepository(Trabajador)
            .createQueryBuilder()
            .delete()
            .where("rut NOT IN (:...ruts)", { 
                ruts: ['20.882.865-7'] 
            })
            .execute();

        console.log("✅ Datos de prueba limpiados exitosamente");

    } catch (error) {
        console.error("❌ Error limpiando datos de prueba:", error);
    }
}

// ==========================================
// HOOKS GLOBALES DE MOCHA PARA LIMPIEZA AUTOMÁTICA
// ==========================================

// Contador global para saber cuándo es el último test
let globalTestCount = 0;
let completedTests = 0;

// Hook que se ejecuta antes de TODOS los tests
export function setupGlobalTestHooks() {
    // Contar todos los tests antes de ejecutarlos
    before(function() {
        const stats = (this as any).parent.stats || {};
        globalTestCount = stats.total || 0;
        console.log(`🧪 Iniciando ${globalTestCount} tests...`);
    });

    // Hook que se ejecuta después de CADA test individual
    afterEach(function() {
        completedTests++;
        console.log(`✅ Test ${completedTests}/${globalTestCount} completado`);
    });

    // Hook que se ejecuta AL FINAL de TODOS los tests
    after(async function() {
        console.log("🔄 Ejecutando limpieza global después de todos los tests...");
        await cleanupAllTestData();
        
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
        
        console.log("🎉 TODOS los tests completados. Base de datos limpiada automáticamente.");
    });
}

// Auto-ejecutar los hooks si estamos en ambiente de test
if (process.env.NODE_ENV === 'test') {
    setupGlobalTestHooks();
}

before(async () => {
    await initializeDatabase();
});

after(async () => {
    await AppDataSource.destroy();
}); 