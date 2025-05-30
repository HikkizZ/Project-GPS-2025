import "reflect-metadata"; // Import reflect-metadata for TypeORM decorators

/* Import the required modules. */
import express, { json, urlencoded, Application} from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";

import indexRoutes from "./routes/index.routes.js";
import { connectDB } from "./config/configDB.js";
import { cookieKey, PORT, HOST } from "./config/configEnv.js";
import { passportJWTSetup } from "./auth/passport.auth.js";
import { initialSetup } from "./utils/initialSetup.js";
import { authenticateJWT } from "./middlewares/authentication.middleware.js";
import { FileManagementService } from "./services/fileManagement.service.js";

// Exportar la aplicación y el servidor para las pruebas
export const app: Application = express();
export let server: any;

async function setupServer(): Promise<void> {
    try {
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

        // Inicializar directorios de archivos
        FileManagementService.ensureUploadDirectories();
        console.log("✅ Directorios de archivos inicializados");

        // Rutas públicas (sin autenticación)
        app.use("/api/auth", indexRoutes);

        // Resto de rutas (protegidas)
        app.use("/api", indexRoutes);

        server = app.listen(PORT, () => {
            console.log(`✅ Server running on http://${HOST}:${PORT}/api`);
        });
    } catch (error) {
        console.error("❌ Error starting the server: -> setupServer(). Error: ", error);
    }
}

export async function setupTestServer(): Promise<{ app: Application; server: any }> {
    try {
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

        // Rutas públicas (sin autenticación)
        app.use("/api/auth", indexRoutes);

        // Middleware de autenticación para rutas protegidas
        app.use("/api/*", authenticateJWT);

        // Resto de rutas (protegidas)
        app.use("/api", indexRoutes);

        await connectDB();
        await initialSetup();

        server = app.listen(0); // Usar puerto aleatorio para pruebas

        console.log("✅ Test server running. DB connected, initial setup done.");

        return { app, server };
    } catch (error) {
        console.error("❌ Error starting the test server: -> setupTestServer(). Error: ", error);
        throw error;
    }
}

async function setupAPI(): Promise<void> {
    try {
        await connectDB();
        await initialSetup();
        await setupServer();
    } catch (error) {
        console.error("❌ Error setting up the API: -> setupAPI(). Error: ", error);
    }
}

// Solo iniciar el servidor si no estamos en modo de prueba
if (process.env.NODE_ENV !== 'test') {
    // Protección adicional: verificar que no se esté ejecutando desde un comando de test
    const isTestCommand = process.argv.some(arg => 
        arg.includes('mocha') || 
        arg.includes('test') || 
        arg.includes('.test.') ||
        process.env.npm_lifecycle_event?.includes('test')
    );

    if (isTestCommand) {
        console.log("⚠️ Detectado comando de test. El servidor NO se iniciará para evitar contaminación de datos.");
        console.log("   Use 'npm run dev' o 'npm start' para iniciar el servidor.");
        process.exit(0);
    }

    setupAPI()
        .then(() => console.log("✅ API started successfully."))
        .catch((error) => console.error("❌ Error starting the API: ", error));
} else {
    console.log("🧪 Modo TEST detectado. Servidor no iniciado automáticamente.");
}
