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

        // Rutas públicas (sin autenticación)
        app.use("/api/auth", indexRoutes);

        // Middleware de autenticación para rutas protegidas
        app.use("/api/*", authenticateJWT);

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
setupAPI()
    .then(() => console.log("✅ API started successfully."))
    .catch((error) => console.error("❌ Error starting the API: ", error));
}
