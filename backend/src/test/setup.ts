import express, { json, urlencoded, Application } from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";

import indexRoutes from "../routes/index.routes.js";
import { cookieKey } from "../config/configEnv.js";
import { passportJWTSetup } from "../auth/passport.auth.js";
import { connectDB } from "../config/configDB.js";
import { initialSetup } from "../utils/initialSetup.js";

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

        await connectDB();
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