import { User } from "../entity/user.entity.js";
import { AppDataSource } from "../config/configDB.js";
import { comparePassword, encryptPassword } from "../utils/encrypt.js";
import { ServiceResponse, QueryParams, UpdateUserData, SafeUser, userRole } from '../../types.d.js';
import { Not, ILike, FindOptionsWhere } from "typeorm";

/* Validar formato de RUT */
function isValidRut(rut: string | null): boolean {
    if (rut === null) return true;
    const rutRegex = /^\d{2}\.\d{3}\.\d{3}-[0-9kK]$/;
    return rutRegex.test(rut);
}

/* Validar formato de email */
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/* Validar rol de usuario */
function isValidRole(role: string): boolean {
    const validRoles: userRole[] = ["SuperAdministrador", "Administrador", "Usuario", "RecursosHumanos", "Gerencia", "Ventas", "Arriendo", "Finanzas", "Mecánico", "Mantenciones de Maquinaria", "Conductor"];
    return validRoles.includes(role as userRole);
}

/* Buscar usuarios con filtros */
export async function getUsersService(query: QueryParams): Promise<ServiceResponse<SafeUser[]>> {
    try {
        if (query.rut && !isValidRut(query.rut)) {
            return [null, "Debe ingresar el RUT en formato xx.xxx.xxx-x"];
        }
        if (query.email && !isValidEmail(query.email)) {
            return [null, "Formato de email inválido"];
        }

        const userRepository = AppDataSource.getRepository(User);

        if (query.rut) {
            const cleanRut = query.rut.replace(/\./g, '').replace(/-/g, '');
            const users = await userRepository.createQueryBuilder("user")
                .where("REPLACE(REPLACE(user.rut, '.', ''), '-', '') = :cleanRut", { cleanRut })
                .andWhere("user.role != :superAdminRole", { superAdminRole: "SuperAdministrador" })
                .getMany();
            if (!users.length) {
                return [[], null];
            }
            const usersData = users.map(({ password, ...user }) => user);
            return [usersData, null];
        }

        const whereClause: FindOptionsWhere<User> = {
            role: Not("SuperAdministrador")
        };
        if (query.id) {
            whereClause.id = query.id;
        }
        if (query.email) {
            whereClause.email = ILike(`%${query.email}%`);
        }
        if (query.role) {
            if (!isValidRole(query.role) || query.role === "SuperAdministrador") {
                return [null, "Rol inválido"];
            }
            whereClause.role = query.role as any;
        }
        if (query.name) {
            whereClause.name = ILike(`%${query.name}%`);
        }
        const users = await userRepository.find({
            where: whereClause,
            order: { id: "ASC" }
        });
        if (!users || users.length === 0) {
            return [[], null];
        }
        const usersData = users.map(({ password, ...user }) => user);
        return [usersData, null];
    } catch (error) {
        console.error("Error en getUsersService:", error);
        return [null, "Error interno del servidor"];
    }
}

/* Actualizar datos de usuario */
// Función auxiliar para limpiar automáticamente los campos de texto de usuarios
function limpiarCamposTextoUsuario(data: any): any {
    const dataCopia = { ...data };
    
    // Aplicar trim y eliminar espacios dobles
    if (dataCopia.name) dataCopia.name = dataCopia.name.trim().replace(/\s+/g, ' ');
    if (dataCopia.email) dataCopia.email = dataCopia.email.trim();
    if (dataCopia.rut) dataCopia.rut = dataCopia.rut.trim();
    
    return dataCopia;
}

export const updateUserService = async (query: {id?: number, rut?: string, email?: string}, body: UpdateUserData, requester: User): Promise<User | null> => {
    try {
        // Validar que no se use 'rol' en vez de 'role'
        if (Object.prototype.hasOwnProperty.call(body, 'rol')) {
            throw { status: 400, message: "El campo correcto es 'role', no 'rol'." };
        }
        body = limpiarCamposTextoUsuario(body);
        const userRepository = AppDataSource.getRepository(User);
        // Buscar usuario por id, rut o email
        let user: User | null = null;
        if (query.id) {
            user = await userRepository.findOne({ where: { id: query.id } });
        } else if (query.rut) {
            const cleanRut = query.rut.replace(/\./g, '').replace(/-/g, '');
            user = await userRepository.createQueryBuilder("user")
                .where("REPLACE(REPLACE(user.rut, '.', ''), '-', '') = :cleanRut", { cleanRut })
                .getOne();
        } else if (query.email) {
            user = await userRepository.findOne({ where: { email: query.email } });
        }
        if (!user) return null;
        if (user.role === "SuperAdministrador") {
            throw { status: 403, message: "No se puede modificar el SuperAdministrador." };
        }
        // Permisos
        const isSelf = requester.id === user.id;
        const allowedRoles = ["SuperAdministrador", "Administrador", "RecursosHumanos"];
        // Si es el mismo usuario, solo puede cambiar su password
        if (isSelf) {
            if (!body.password || Object.keys(body).length !== 1) {
                throw { status: 403, message: "Solo puedes cambiar tu propia contraseña." };
            }
        } else {
            // Si no es el mismo usuario, debe tener rol permitido
            if (!allowedRoles.includes(requester.role)) {
                throw { status: 403, message: "No tienes permisos para modificar a otros usuarios." };
            }
            // No puede cambiar su propio rol
            if (body.role && user.id === requester.id) {
                throw { status: 403, message: "No puedes cambiar tu propio rol." };
            }
            // No puede cambiar a SuperAdministrador
            if (body.role === "SuperAdministrador") {
                throw { status: 403, message: "No se puede cambiar un usuario a SuperAdministrador." };
            }
        }
        // Solo se permite cambiar password y/o role (según permisos)
        const dataUserUpdate: any = {};
        if (body.password) {
            dataUserUpdate.password = await encryptPassword(body.password);
        }
        if (body.role && !isSelf) {
            dataUserUpdate.role = body.role as string;
        }
        dataUserUpdate.updateAt = new Date();
        await userRepository.update(user.id, dataUserUpdate);
        const updatedUser = await userRepository.findOne({ where: { id: user.id } });
        return updatedUser;
    } catch (error) {
        console.error('Error en updateUserService:', error);
        throw error;
    }
};