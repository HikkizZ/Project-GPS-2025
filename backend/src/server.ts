import "reflect-metadata"; // Import reflect-metadata for TypeORM decorators

/* Import the required modules. */
import express, { json, urlencoded, Application} from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import indexRoutes from "./routes/index.routes.js";
import { AppDataSource, initializeDatabase } from "./config/configDB.js";
import { cookieKey, PORT, HOST } from "./config/configEnv.js";
import { passportJWTSetup } from "./auth/passport.auth.js";
import { initialSetup } from "./utils/initialSetup.js";
import { authenticateJWT } from "./middlewares/authentication.middleware.js";
import { FileManagementService } from "./services/fileManagement.service.js";
import { FileUploadService } from "./services/fileUpload.service.js";
import userRoutes from "./routes/user.routes.js";
import { verificarLicenciasVencidasService } from "./services/recursosHumanos/licenciaPermiso.service.js";
import cron from "node-cron";

// --- Definición de Rutas para ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Exportar la aplicación y el servidor para las pruebas
export const app: Application = express();
let server: any;

// Configuración de variables de entorno
config();

// Determinar el entorno
const isProduction = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";
const isDevelopment = !isProduction && !isTest;

// Valores por defecto para PORT y HOST
const DEFAULT_PORT = 3000;
const DEFAULT_HOST = 'localhost';

// Asegurar que PORT y HOST tengan valores válidos
const SERVER_PORT = Number(PORT) || DEFAULT_PORT;
const SERVER_HOST = HOST || DEFAULT_HOST;

// Función para inicializar la verificación automática de licencias vencidas
function initializeAutomaticLicenseVerification(): void {
    // Programar la tarea para que se ejecute todos los días a las 00:01
    cron.schedule("1 0 * * *", async () => {
        try {
            const [actualizaciones, error] = await verificarLicenciasVencidasService();
            
            if (error) {
                console.error("❌ Error al verificar licencias vencidas:", error);
                return;
            }

            if (actualizaciones && actualizaciones > 0) {
                console.log(`✅ Verificación completada. ${actualizaciones} estados actualizados a Activo`);
            }
        } catch (error) {
            console.error("❌ Error inesperado durante la verificación de licencias:", error);
        }
    });
    
    // En desarrollo, también ejecutar inmediatamente para verificar que funciona
    if (isDevelopment) {
        setTimeout(async () => {
            try {
                const [actualizaciones, error] = await verificarLicenciasVencidasService();
                
                if (error) {
                    console.error("❌ Error en verificación inicial:", error);
                    return;
                }

                if (actualizaciones && actualizaciones > 0) {
                    console.log(`✅ Verificación inicial completada. ${actualizaciones} estados actualizados`);
                }
            } catch (error) {
                console.error("❌ Error en verificación inicial:", error);
            }
        }, 3000); // Esperar 3 segundos después del inicio
    }
}

async function setupServer(): Promise<void> {
    try {
        app.disable("x-powered-by");

        app.use(cors({
            origin: true,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
        }));
        
        app.use(urlencoded({
            extended: true,
            limit: "1mb"
        }));

        app.use(json({
            limit: "1mb"
        }));

        app.use(cookieParser());

        // Solo usar morgan en desarrollo
        if (isDevelopment) {
            app.use(morgan("dev"));
        }

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
        passportJWTSetup();

        // Middleware global para encoding UTF-8 en todas las respuestas JSON
        app.use((req, res, next) => {
            // No sobreescribir el Content-Type para descargas de archivos
            if (!res.getHeader('Content-Disposition')) {
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
            }
            next();
        });

        // Inicializar directorios de archivos
        FileManagementService.ensureUploadDirectories();
        FileUploadService.initialize();
        if (isDevelopment) console.log("✅ Directorios de archivos inicializados");
        
        // --- SERVIR ARCHIVOS ESTÁTICOS ---
        // Servir la carpeta 'uploads' que está en el directorio raíz del backend
        app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

        // Configurar todas las rutas bajo /api
        app.use("/api", indexRoutes);
        app.use("/api/users", userRoutes);

        server = app.listen(PORT, () => {
            console.log("✅ API started successfully.");
            console.log(`✅ Servidor iniciado en http://${SERVER_HOST}:${SERVER_PORT}/api`);
            
            // Inicializar verificación automática de licencias vencidas
            initializeAutomaticLicenseVerification();
        });
    } catch (error) {
        console.error("❌ Error al iniciar el servidor:", error);
    }
}

async function setupTestServer(): Promise<{ app: Application; server: any }> {
    try {
        app.disable("x-powered-by");

        app.use(cors({
            origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'https://hoppscotch.io'],
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
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

        // Configurar todas las rutas bajo /api
        app.use("/api", indexRoutes);
        app.use("/api/users", userRoutes);

        await initializeDatabase();
        await initialSetup();

        server = app.listen(0); // Usar puerto aleatorio para pruebas
        console.log("✅ Test server running. DB connected, initial setup done.");

        return { app, server };
    } catch (error) {
        console.error("❌ Error starting the test server: -> setupTestServer(). Error: ", error);
        throw error;
    }
}

// Inicialización del servidor
const startServer = async () => {
  try {
    console.log("\n🚀 Iniciando GPS 2025 API...\n");
    
    // Conectar a la base de datos
    await initializeDatabase();

    // Configuración inicial
    await initialSetup();

    // Configurar el servidor
    app.disable("x-powered-by");

    app.use(cors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
    }));
    
    app.use(urlencoded({
      extended: true,
      limit: "1mb"
    }));

    app.use(json({
      limit: "1mb"
    }));

    app.use(cookieParser());

    // Solo usar morgan en desarrollo
    if (isDevelopment) {
      app.use(morgan("dev"));
    }

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
    passportJWTSetup();

    // Middleware global para encoding UTF-8 en todas las respuestas JSON
    app.use((req, res, next) => {
      // No sobreescribir el Content-Type para descargas de archivos
      if (!res.getHeader('Content-Disposition')) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
      }
      next();
    });

    // Inicializar directorios de archivos
    FileManagementService.ensureUploadDirectories();
    FileUploadService.initialize();
    if (isDevelopment) console.log("✅ Directorios de archivos inicializados");
    
    // --- SERVIR ARCHIVOS ESTÁTICOS ---
    // Servir la carpeta 'uploads' que está en el directorio raíz del backend
    app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

    // Configurar todas las rutas bajo /api
    app.use("/api", indexRoutes);
    app.use("/api/users", userRoutes);

    server = app.listen(PORT, () => {
      console.log("✅ API started successfully.");
      console.log(`✅ Servidor iniciado en http://${SERVER_HOST}:${SERVER_PORT}/api`);
      
      // Inicializar verificación automática de licencias vencidas
      initializeAutomaticLicenseVerification();
    });

  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error);
    process.exit(1);
  }
};

// Iniciar el servidor si no estamos en modo test
if (!isTest) {
  startServer();
} else {
  console.log("⚠️ Detectado comando de test. El servidor NO se iniciará.");
}
