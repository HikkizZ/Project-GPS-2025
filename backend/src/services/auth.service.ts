import jwt from "jsonwebtoken";
import { User } from "../entity/user.entity.js";
import { AppDataSource } from "../config/configDB.js";
import { comparePassword, encryptPassword } from "../helpers/bcrypt.helper.js";
import { ACCESS_TOKEN_SECRET } from "../config/configEnv.js";
import { formatToLocalTime } from "../utils/formatDate.js";
import { UserResponse, userRole } from '../../types.d.js';
import { formatRut } from "../helpers/rut.helper.js";
import { Trabajador } from "../entity/recursosHumanos/trabajador.entity.js";

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
  role: userRole;
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

/* Definición de roles permitidos */
const allowedRoles = ["Administrador", "RecursosHumanos", "Usuario"];

/* Auxiliar function for creating error messages */
const createErrorMessage = (dataInfo: Partial<LoginData | RegisterData>, message: string): authError => ({ dataInfo, message });

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

        if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)) {
            return [null, createErrorMessage({ email }, "El dominio del email no es válido.")];
        }

        // Validaciones de formato de contraseña
        if (password.length < 8) {
            return [null, createErrorMessage({ password }, "La contraseña debe tener al menos 8 caracteres.")];
        }

        if (password.length > 16) {
            return [null, createErrorMessage({ password }, "La contraseña debe tener menos de 16 caracteres.")];
        }

        if (!/^[a-zA-Z0-9]+$/.test(password)) {
            return [null, createErrorMessage({ password }, "La contraseña solo puede contener letras y números.")];
        }

        // Buscar usuario y verificar credenciales
        const userFound = await userRepository.findOne({ where: { email } });

        if (!userFound) {
            return [null, createErrorMessage({ email }, "El email ingresado no está registrado.")];
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

export async function registerService(user: RegisterData, userRole: string): Promise<[UserResponse | null, authError | string | null]> {
  try {
        const userRepository = AppDataSource.getRepository(User);
        const trabajadorRepository = AppDataSource.getRepository(Trabajador);
    const { name, rut, email, password, role } = user;

        // Validaciones básicas
        if (!name || name.trim() === "") {
            return [null, createErrorMessage({ name }, "El nombre es requerido.")];
        }

        if (name.length < 3) {
            return [null, createErrorMessage({ name }, "El nombre debe tener al menos 3 caracteres.")];
        }

        if (name.length > 70) {
            return [null, createErrorMessage({ name }, "El nombre debe tener menos de 70 caracteres.")];
        }

        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name)) {
            return [null, createErrorMessage({ name }, "El nombre solo puede contener letras y espacios.")];
        }

        // Validaciones de RUT
        if (!rut || rut.trim() === "") {
            return [null, createErrorMessage({ rut }, "El RUT es requerido.")];
        }

        if (!formatRut(rut)) {
            return [null, createErrorMessage({ rut }, "El RUT ingresado no es válido.")];
        }

        if (rut.length < 8) {
            return [null, createErrorMessage({ rut }, "El RUT debe tener al menos 8 caracteres.")];
        }

        if (rut.length > 12) {
            return [null, createErrorMessage({ rut }, "El RUT debe tener menos de 12 caracteres.")];
        }

        // Validaciones de email
        if (!email || email.trim() === "") {
            return [null, createErrorMessage({ email }, "El email es requerido.")];
        }

        if (email.length < 15) {
            return [null, createErrorMessage({ email }, "El email debe tener al menos 15 caracteres.")];
        }

        if (email.length > 50) {
            return [null, createErrorMessage({ email }, "El email debe tener menos de 50 caracteres.")];
        }

        if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)) {
            return [null, createErrorMessage({ email }, "El dominio del email no es válido.")];
        }

        // Validaciones de contraseña
        if (!password || password.trim() === "") {
            return [null, createErrorMessage({ password }, "La contraseña es requerida.")];
        }

        if (password.length < 8) {
            return [null, createErrorMessage({ password }, "La contraseña debe tener al menos 8 caracteres.")];
        }

        if (password.length > 16) {
            return [null, createErrorMessage({ password }, "La contraseña debe tener menos de 16 caracteres.")];
        }

        if (!/^[a-zA-Z0-9]+$/.test(password)) {
            return [null, createErrorMessage({ password }, "La contraseña solo puede contener letras y números.")];
        }

        // Verificar si ya existe un usuario con el mismo email o RUT
        const [existingEmailUser, existingRutUser] = await Promise.all([
            userRepository.findOne({ where: { email } }),
            userRepository.findOne({ where: { rut } })
        ]);

        if (existingEmailUser) {
            return [null, createErrorMessage({ email }, "El email ingresado ya está registrado.")];
        }

        if (existingRutUser) {
            return [null, createErrorMessage({ rut }, "El RUT ingresado ya está registrado.")];
        }

        // Verificar si existe el trabajador
        const trabajador = await trabajadorRepository.findOne({ where: { rut } });
        if (!trabajador) {
            return [null, createErrorMessage({ rut }, "No existe un trabajador con este RUT.")];
        }

        // Verificar que el email coincida con el del trabajador
        if (trabajador.correo !== email) {
            return [null, createErrorMessage({ email }, "El email debe coincidir con el email del trabajador.")];
        }

        // Verificar que el rol sea válido
        if (!allowedRoles.includes(role)) {
            return [null, createErrorMessage({ role }, "Rol no válido.")];
        }

        const newUser = userRepository.create({
      name,
      rut,
      email,
            password: await encryptPassword(password),
            role
    });

        await userRepository.save(newUser);

        const { password: _, ...userData } = newUser;

    const userResponse: UserResponse = {
            id: userData.id,
            name: userData.name,
            rut: userData.rut,
            email: userData.email,
            role: userData.role,
            createAt: formatToLocalTime(userData.createAt),
            updateAt: formatToLocalTime(userData.updateAt)
    };

    return [userResponse, null];
  } catch (error) {
        console.error("❌ Error registering user: ", error);
        return [null, "Error interno del servidor."];
  }
}