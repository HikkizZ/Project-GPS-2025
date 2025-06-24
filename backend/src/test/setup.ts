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

let app: Application;
let server: any;

// Configurar la aplicación para pruebas
before(async function() {
    this.timeout(10000);
    
    // Inicializar la base de datos
    await initializeDatabase();
    
    // Configurar Express
    app = express();
    app.disable("x-powered-by");
    
    // Middlewares
    app.use(cors({ origin: true, credentials: true }));
    app.use(urlencoded({ extended: true, limit: "1mb" }));
    app.use(json({ limit: "1mb" }));
    app.use(cookieParser());
    app.use(morgan("dev"));
    
    // Configurar sesión y autenticación
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
    
    // Rutas
    app.use("/api", indexRoutes);
    
    // Configuración inicial
    await initialSetup();
    
    // Iniciar servidor
    server = app.listen(0);
});

// Limpiar después de las pruebas
after(async function() {
    this.timeout(10000);
    
    try {
        // Limpiar datos de prueba
        if (AppDataSource.isInitialized) {
            await AppDataSource.getRepository(LicenciaPermiso).delete({});
            await AppDataSource.getRepository(HistorialLaboral).delete({});
            await AppDataSource.getRepository(FichaEmpresa).delete({});
            
            // Mantener solo el usuario admin
            await AppDataSource.getRepository(User)
                .createQueryBuilder()
                .delete()
                .where("rut NOT IN (:...ruts)", { ruts: [] })
                .execute();
                
            await AppDataSource.getRepository(Trabajador)
                .createQueryBuilder()
                .delete()
                .where("rut NOT IN (:...ruts)", { ruts: [] })
                .execute();
        }
    } catch (error) {
        console.error("Error limpiando datos de prueba:", error);
    }
    
    // Cerrar servidor y conexión a BD
    if (server) {
        await new Promise((resolve) => server.close(resolve));
    }
    if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
    }
});

export { app, server }; 