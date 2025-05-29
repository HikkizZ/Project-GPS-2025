import { User } from "../entity/user.entity.js";
import { AppDataSource } from "../config/configDB.js";
import { comparePassword, encryptPassword } from "../helpers/bcrypt.helper.js";
import { userRole, ServiceResponse, QueryParams, UpdateUserData, SafeUser } from '../../types.js';
import { Not, ILike, FindOptionsWhere } from "typeorm";

/* Validar formato de RUT */
function isValidRut(rut: string): boolean {
    const rutRegex = /^[0-9]{1,2}\.[0-9]{3}\.[0-9]{3}-[0-9kK]$/;
    return rutRegex.test(rut);
}

/* Validar formato de email */
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/* Validar rol de usuario */
function isValidRole(role: string): boolean {
    const validRoles = ["Administrador", "RecursosHumanos", "Usuario"];
    return validRoles.includes(role);
}

/* Buscar usuarios con filtros */
export async function searchUsersService(query: QueryParams): Promise<ServiceResponse<SafeUser[]>> {
    try {
        // Validar formato de RUT y email si están presentes
        if (query.rut && !isValidRut(query.rut)) {
            return [null, "Formato de RUT inválido"];
        }
        if (query.email && !isValidEmail(query.email)) {
            return [null, "Formato de email inválido"];
        }

        const userRepository = AppDataSource.getRepository(User);
        const whereClause: FindOptionsWhere<User> = {};

        // Agregar cada campo de búsqueda si está presente en la query
        if (query.id) {
            whereClause.id = query.id;
        }

        if (query.rut) {
            whereClause.rut = ILike(`%${query.rut}%`);
        }

        if (query.email) {
            whereClause.email = ILike(`%${query.email}%`);
        }

        if (query.role) {
            if (!isValidRole(query.role)) {
                return [null, "Rol inválido"];
            }
            whereClause.role = query.role;
        }

        if (query.name) {
            whereClause.name = ILike(`%${query.name}%`);
        }

        const users = await userRepository.find({
            where: whereClause,
            order: { id: "ASC" }
        });

        if (!users || users.length === 0) {
            return [[], null]; // Retornar array vacío en lugar de error
        }

        const usersData = users.map(({ password, ...user }) => user);
        return [usersData, null];
    } catch (error) {
        console.error("Error en searchUsersService:", error);
        return [null, "Error interno del servidor"];
    }
}

/* Obtener usuario(s) por ID, RUT, Email o Role */
export async function getUserService(query: QueryParams): Promise<ServiceResponse<SafeUser[]>> {
    try {
        const [users, error] = await searchUsersService(query);
        
        if (error) return [null, error];
        if (!users) return [[], null]; // Retornar array vacío
        
        return [users, null];
    } catch (error) {
        console.error("Error in getUserService:", error);
        return [null, "Error interno del servidor"];
    }
}

/* Obtener todos los usuarios */
export async function getUsersService(): Promise<ServiceResponse<SafeUser[]>> {
    try {
        const userRepository = AppDataSource.getRepository(User);
        const users = await userRepository.find({
            order: { id: "ASC" }
        });

        if (!users || users.length === 0) return [[], null]; // Retornar array vacío

        const usersData = users.map(({ password, ...user }) => user);
        return [usersData, null];
    } catch (error) {
        console.error("Error in getUsersService:", error);
        return [null, "Error interno del servidor"];
    }
}

/* Actualizar datos de usuario */
export async function updateUserService(query: QueryParams, body: UpdateUserData, requester: User): Promise<ServiceResponse<SafeUser>> {
    try {
        const { id, rut, email } = query;
        const userRepository = AppDataSource.getRepository(User);
        
        // Validar formato de RUT y email si están presentes
        if (rut && !isValidRut(rut)) {
            return [null, "Formato de RUT inválido"];
        }
        if (email && !isValidEmail(email)) {
            return [null, "Formato de email inválido"];
        }

        const userFound = await userRepository.findOne({
            where: [{ id }, { rut }, { email }],
        });

        if (!userFound) return [null, "Usuario no encontrado"];

        /* Only admin can update roles */
        if (requester.role !== "Administrador") {
            return [null, "No tienes permisos para modificar roles"];
        }

        /* Only allow updating the role field */
        if (!body.role) {
            return [null, "El campo role es requerido"];
        }

        /* Validate role */
        if (!isValidRole(body.role)) {
            return [null, "Rol inválido"];
        }

        /* Prevent updating protected users */
        if (userFound.role === "Administrador" && userFound.rut === "11.111.111-1") {
            return [null, "No se puede modificar el rol del administrador principal"];
        }

        const dataUserUpdate: Partial<User> = {
            role: body.role,
            updateAt: new Date(),
        };

        await userRepository.update({ id: userFound.id }, dataUserUpdate);

        const userData = await userRepository.findOne({ where: { id: userFound.id } });

        if (!userData) return [null, "Usuario no encontrado después de actualizar"];

        const { password, ...userUpdated } = userData;
        return [userUpdated, null];
    } catch (error) {
        console.error("Error al modificar un usuario:", error);
        return [null, "Error interno del servidor"];
    }
}

/* Eliminar un usuario, validando el rol del solicitante */
export async function deleteUserService(query: QueryParams, requester: User): Promise<ServiceResponse<SafeUser>> {
    try {
        const { id, rut, email } = query;
        const userRepository = AppDataSource.getRepository(User);

        // Validar formato de RUT y email si están presentes
        if (rut && !isValidRut(rut)) {
            return [null, "Formato de RUT inválido"];
        }
        if (email && !isValidEmail(email)) {
            return [null, "Formato de email inválido"];
        }

        const userFound = await userRepository.findOne({
            where: [{ id }, { rut }, { email }],
        });

        if (!userFound) return [null, "Usuario no encontrado"];

        /* Prohibit if the requester is not admin */
        if (requester.role !== "Administrador") {
            return [null, "No tienes permisos para eliminar usuarios"];
        }

        /* Prevent deleting protected users */
        if (userFound.role === "Administrador" && userFound.rut === "11.111.111-1") {
            return [null, "No se puede eliminar el administrador principal"];
        }

        const userDeleted = await userRepository.remove(userFound);

        const { password, ...dataUser } = userDeleted;
        return [dataUser, null];
    }
    catch (error) {
        console.error("Error al eliminar un usuario:", error);
        return [null, "Error interno del servidor"];
    }
}