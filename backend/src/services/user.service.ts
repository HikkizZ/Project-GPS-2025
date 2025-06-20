import { User } from "../entity/user.entity.js";
import { AppDataSource } from "../config/configDB.js";
import { comparePassword, encryptPassword } from "../utils/encrypt.js";
import { ServiceResponse, QueryParams, UpdateUserData, SafeUser, userRole } from '../../types.d.js';
import { Not, ILike, FindOptionsWhere, FindOperator, Equal } from "typeorm";

/* Validar formato de RUT */
function isValidRut(rut: string): boolean {
    // Solo aceptar formato xx.xxx.xxx-x
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
    const validRoles: userRole[] = ["SuperAdministrador", "Administrador", "Usuario", "RecursosHumanos", "Gerencia", "Ventas", "Arriendo", "Finanzas"];
    return validRoles.includes(role as userRole);
}

/* Buscar usuarios con filtros */
export async function searchUsersService(query: QueryParams): Promise<ServiceResponse<SafeUser[]>> {
    try {
        // Validar formato de RUT y email si están presentes
        if (query.rut && !isValidRut(query.rut)) {
            return [null, "Debe ingresar el RUT en formato xx.xxx.xxx-x"];
        }
        if (query.email && !isValidEmail(query.email)) {
            return [null, "Formato de email inválido"];
        }

        const userRepository = AppDataSource.getRepository(User);

        // Búsqueda exacta por RUT (sin puntos ni guion)
        if (query.rut) {
            const cleanRut = query.rut.replace(/\./g, '').replace(/-/g, '');
            const users = await userRepository.createQueryBuilder("user")
                .where("REPLACE(REPLACE(user.rut, '.', ''), '-', '') = :cleanRut", { cleanRut })
                .getMany();
            if (!users.length) {
                return [[], null];
            }
            const usersData = users.map(({ password, ...user }) => user);
            return [usersData, null];
        }

        // Resto de filtros (nombre, email, rol, etc.)
        const whereClause: FindOptionsWhere<User> = {};
        if (query.id) {
            whereClause.id = query.id;
        }
        if (query.email) {
            whereClause.email = ILike(`%${query.email}%`);
        }
        if (query.role) {
            if (!isValidRole(query.role)) {
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
        console.error("Error en searchUsersService:", error);
        return [null, "Error interno del servidor"];
    }
}

/* Obtener usuario(s) por ID, RUT, Email o Role */
export const getUserService = async (query: { id?: number; role?: string }) => {
    try {
        const userRepo = AppDataSource.getRepository(User);
        const whereClause: any = {};

        if (query.id) {
            whereClause.id = query.id;
        }

        if (query.role) {
            whereClause.role = query.role;
        }

        const user = await userRepo.findOne({ where: whereClause });
        return user;
    } catch (error) {
        console.error("Error in getUserService:", error);
        throw error;
    }
};

/* Obtener todos los usuarios */
export async function getUsersService(): Promise<User[]> {
    try {
        const userRepository = AppDataSource.getRepository(User);
        const users = await userRepository.find();
        return users;
    } catch (error) {
        console.error('Error en getUsersService:', error);
        throw error;
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

        if (user.rut === "11.111.111-1") {
            throw { status: 403, message: "No se puede modificar el superadministrador." };
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

export const updateUserByTrabajadorService = async (id: number, body: UpdateUserData): Promise<User | null> => {
    try {
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({
            where: { id }
        });

        if (!user) {
            return null;
        }

        if (user.rut === "11.111.111-1") {
            throw { status: 403, message: "No se puede modificar el superadministrador." };
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
        console.error('Error en updateUserByTrabajadorService:', error);
        throw error;
    }
};