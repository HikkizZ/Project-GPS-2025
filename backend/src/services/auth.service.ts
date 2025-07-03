import jwt from "jsonwebtoken";
import { User } from "../entity/user.entity.js";
import { AppDataSource } from "../config/configDB.js";
import { comparePassword, encryptPassword } from "../utils/encrypt.js";
import { ACCESS_TOKEN_SECRET } from "../config/configEnv.js";
import { UserResponse, UserData, userRole, LoginResponse } from "../../types.d.js";
import { formatRut } from "../helpers/rut.helper.js";
import { Trabajador } from "../entity/recursosHumanos/trabajador.entity.js";
import bcrypt from "bcrypt";

/* Interface for the user data */
interface LoginData {
  email: string;
  password: string;
}

/* Interface for JWT Payload */
interface JWTPayload {
  name: string;
  email: string;
  role: userRole;
  rut: string | null;
}

/* Interface for error messages */
interface authError {
  dataInfo: Partial<LoginData>;
  message: string;
}

/* Definición de roles permitidos */
const allowedRoles: userRole[] = [
    "SuperAdministrador",
    "Administrador",
    "Usuario",
    "RecursosHumanos",
    "Gerencia",
    "Ventas",
    "Arriendo",
    "Finanzas",
    "Mecánico",
    "Mantenciones de Maquinaria",
    "Conductor"
];

/* Auxiliar function for creating error messages */
const createErrorMessage = (dataInfo: Partial<LoginData>, message: string): authError => ({ dataInfo, message });

export async function loginService(user: LoginData): Promise<[string | null, authError | string | null]> {
  try {
        const userRepository = AppDataSource.getRepository(User);
    const { email, password } = user;

        // Validaciones básicas
        if (!email || email.trim() === "") {
            return [null, createErrorMessage({ email }, "El email es requerido.")];
        }

        if (!password || password.trim() === "") {
            return [null, createErrorMessage({ password }, "La contraseña es requerida.")];
        }

        // Validaciones de formato de email
        if (email.length < 15) {
            return [null, createErrorMessage({ email }, "El email debe tener al menos 15 caracteres.")];
        }

        if (email.length > 50) {
            return [null, createErrorMessage({ email }, "El email debe tener menos de 50 caracteres.")];
        }

        if (!/^[a-zA-Z0-9._%+-]+@(gmail\.com|outlook\.com|hotmail\.com|gmail\.cl|outlook\.cl|hotmail\.cl|lamas\.com|live\.cl)$/.test(email)) {
            return [null, createErrorMessage({ email }, "El dominio del email no es válido.")];
        }

        // Validaciones de formato de contraseña
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,16}$/.test(password)) {
            return [null, createErrorMessage({ password }, "La contraseña debe tener entre 8 y 16 caracteres, al menos una mayúscula, una minúscula, un número y un carácter especial.")];
        }

        // Buscar usuario y verificar credenciales
        const userFound = await userRepository.findOne({ where: { email } });

        if (!userFound) {
            return [null, createErrorMessage({ email }, "El email ingresado no está registrado.")];
        }

        // Verificar estado de la cuenta
        if (userFound.estadoCuenta === "Inactiva") {
            return [null, createErrorMessage({ email }, "Esta cuenta ha sido desactivada. Por favor, contacte al administrador.")];
        }

        const isMatch = await comparePassword(password, userFound.password);
        if (!isMatch) {
            return [null, createErrorMessage({ password }, "La contraseña ingresada es incorrecta.")];
        }

        const payload: JWTPayload = {
            name: userFound.name,
            email: userFound.email,
            role: userFound.role,
            rut: userFound.rut
        };

        if (!ACCESS_TOKEN_SECRET) {
            return [null, "Error interno del servidor. Falta la clave secreta."];
        }        

        const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: "1d" });
        return [accessToken, null];
  } catch (error) {
        console.error("❌ Error en login: ", error);
        return [null, "Error interno del servidor."];
  }
}

export const createUserService = async (userData: UserData): Promise<[UserResponse | null, string | null]> => {
    try {
        const { name, email, password, role, rut } = userData;

        // Verificar si el usuario ya existe
        const existingUser = await AppDataSource.getRepository(User).findOne({
            where: [
                { email },
                { rut }
            ]
        });

        if (existingUser) {
            return [null, "El usuario ya existe"];
        }

        // Crear nuevo usuario
        const newUser = new User();
        newUser.name = name;
        newUser.email = email;
        newUser.password = await encryptPassword(password);
        newUser.role = role;
        newUser.rut = rut;
        newUser.estadoCuenta = "Activa";

        // Guardar usuario
        const savedUser = await AppDataSource.getRepository(User).save(newUser);

        // Retornar usuario sin contraseña
        const userResponse: UserResponse = {
            id: savedUser.id,
            name: savedUser.name,
            email: savedUser.email,
            role: savedUser.role,
            rut: savedUser.rut,
            estadoCuenta: savedUser.estadoCuenta,
            createAt: savedUser.createAt,
            updateAt: savedUser.updateAt
        };

        return [userResponse, null];
    } catch (error) {
        console.error("Error en createUserService:", error);
        return [null, "Error al crear el usuario"];
    }
};