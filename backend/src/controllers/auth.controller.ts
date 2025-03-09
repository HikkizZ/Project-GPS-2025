import { Request, Response } from "express";
import { loginService, registerService } from "../services/auth.service.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../handlers/responseHandlers.js";
import { authValidation, registerValidation } from "../validations/auth.validation.js";

/* Login controller */
export async function login(req: Request, res: Response): Promise<void> {
    try {
        const { body } = req; // 📌 Get the body data.

        const { error } = authValidation.validate(body); // 📌 Validate the body data.
        if (error) {
            handleErrorClient(res, 400,error.message);
            return;
        }

        const [accessToken, errorToken] = await loginService(body);

        if (errorToken) {
            const errorMessage = typeof errorToken === "string" ? errorToken : errorToken.message;
            handleErrorClient(res, 401, errorMessage, {});
            return;
        }

        res.cookie("jwt", accessToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
        })

        handleSuccess(res, 200, "Usuario autenticado.", { token: accessToken });
    } catch (error) {
        handleErrorServer(res, 500, (error as Error).message);
    }
}

/* Register controller */
export async function register(req: Request, res: Response): Promise<void> {
    try {
        const { body } = req; // 📌 Get the body data.

        const { error } = registerValidation.validate(body); // 📌 Validate the body data.
        if (error) {
            handleErrorClient(res, 400, error.message);
            return;
        }

        const [newUser, errorNewUser] = await registerService(body);

        if (errorNewUser) {
            const errorMessage = typeof errorNewUser === "string" ? errorNewUser : errorNewUser.message;
            handleErrorClient(res, 400, errorMessage, {});
            return;
        }

        if (!newUser) { //? NewUser must not be null.
            handleErrorServer(res, 500, "Error inesperado: No se pudo registrar el usuario.");
            return;
        }

        handleSuccess(res, 201, "Usuario registrado.", newUser);
    } catch (error) {
        handleErrorServer(res, 500, (error as Error).message);
    }
}

/* Logout controller */
export async function logout(_req: Request, res: Response): Promise<void> {
    try {
        res.clearCookie("jwt", { httpOnly: true });

        handleSuccess(res, 200, "Usuario deslogueado.", {});
    } catch (error) {
        handleErrorServer(res, 500, (error as Error).message);
    }
}