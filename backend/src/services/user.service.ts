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
export const updateUserService = async (id: number, body: UpdateUserData, requester: User): Promise<User | null> => {
    try {
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({
            where: { id }
        });

        if (!user) {
            return null;
        }

        if (user.role === "SuperAdministrador") {
            throw { status: 403, message: "No se puede modificar el SuperAdministrador." };
        }

        const dataUserUpdate: any = {};

        if (body.name) {
            dataUserUpdate.name = body.name;
        }
        if (body.email) {
            dataUserUpdate.email = body.email;
        }
        if (body.password) {
            dataUserUpdate.password = await encryptPassword(body.password);
        }
        if (body.role) {
            if (body.role === "SuperAdministrador") {
                throw { status: 403, message: "No se puede cambiar un usuario a SuperAdministrador." };
            }
            dataUserUpdate.role = body.role as string;
        }
        if (body.rut) {
            dataUserUpdate.rut = body.rut;
        }

        dataUserUpdate.updateAt = new Date();

        await userRepository.update(id, dataUserUpdate);

        const updatedUser = await userRepository.findOne({
            where: { id }
        });

        return updatedUser;
    } catch (error) {
        console.error('Error en updateUserService:', error);
        throw error;
    }
};