"use strict";

import jwt from "jsonwebtoken";
import { User } from "../entity/user.entity.js";
import { AppDataSource } from "../config/configDB.js";
import { comparePassword, encryptPassword } from "../helpers/bcrypt.helper.js";
import { ACCESS_TOKEN_SECRET } from "../config/configEnv.js";
import { formatToLocalTime } from "../utils/formatDate.js";

/* Interface for the user data */
interface LoginData {
    email: string;
    password: string;
}

interface RegisterData {
    name: string;
    rut: string;
    email: string;
    password: string;
}

/* Interface for JWT Payload */
interface JWTPayload {
    name: string;
    email: string;
    role: string;
    rut: string;
}

/* Interface for error messages */
interface authError {
    dataInfo: Partial<LoginData | RegisterData>;
    message: string;
}

/* Auxiliar function for creating error messages */
const createErrorMessage = (dataInfo: Partial<LoginData | RegisterData>, message: string): authError => ({ dataInfo, message });

export async function loginService(user: LoginData): Promise<[string | null, authError | string | null]> {
    try {
        const userRepository = AppDataSource.getRepository(User);
        const { email, password } = user;

        const userFound = await userRepository.findOne({ where: { email } });

        if (!userFound) return [null, createErrorMessage({ email }, "El email ingresado no está registrado.")];

        const isMatch = await comparePassword(password, userFound.password);
        if (!isMatch) return [null, createErrorMessage({ email }, "La contraseña ingresada es incorrecta.")];

        console.log(`User ${email} logged in at ${formatToLocalTime(new Date())}.`);

        const payload: JWTPayload = {
            name: userFound.name,
            email: userFound.email,
            role: userFound.role,
            rut: userFound.rut
        };

        console.log("JWT Payload: ", payload);

        /* Verify if the secret key is defined */
        if (!ACCESS_TOKEN_SECRET) {
            throw new Error("Missing ACCESS_TOKEN_SECRET in environment variables");
        }

        /* 🔐 Generate token with duration of 1 day */
        const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: "1d" });

        return [accessToken, null];
    } catch (error) {
        console.error("Error logging in: ", error);
        return [null, "Error interno del servidor."];
    }
}

export async function registerService(user: RegisterData): Promise<[Partial<User> | null, authError | string | null]> {
    try {
        const userRepository = AppDataSource.getRepository(User);
        const { name, rut, email, password } = user;

        const existingEmailUser = await userRepository.findOne({ where: { email } });
        if (existingEmailUser) return [null, createErrorMessage({ email }, "El email ingresado ya está registrado.")];

        const existingRutUser = await userRepository.findOne({ where: { rut } });
        if (existingRutUser) return [null, createErrorMessage({ rut }, "El rut ingresado ya está registrado.")];

        const newUser = userRepository.create({
            name,
            rut,
            email,
            password: await encryptPassword(password),
            role: "Usuario"
        });

        await userRepository.save(newUser);

        /* Remove the password from the returned data */
        const { password: _, ...userData } = newUser;

        const formattedUserData = {
            ...userData,
            formattedCreateAt: formatToLocalTime(userData.createAt),
            formattedUpdateAt: formatToLocalTime(userData.updateAt)
        }

        return [formattedUserData, null];
    } catch (error) {
        console.error("Error registering user: ", error);
        return [null, "Error interno del servidor."];
    }
}