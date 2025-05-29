import { User } from "../entity/user.entity.js";
import { AppDataSource } from "../config/configDB.js";
import { comparePassword, encryptPassword } from "../helpers/bcrypt.helper.js";
import { userRole, ServiceResponse, QueryParams, UpdateUserData, SafeUser } from '../../types.js';
import { Not, ILike, FindOptionsWhere } from "typeorm";

/* Buscar usuarios con filtros */
export async function searchUsersService(query: QueryParams): Promise<ServiceResponse<SafeUser[]>> {
  try {
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
      whereClause.role = ILike(`%${query.role}%`);
    }

    if (query.name) {
      whereClause.name = ILike(`%${query.name}%`);
    }

    const users = await userRepository.find({
      where: whereClause,
      order: { id: "ASC" }
    });

    if (!users || users.length === 0) {
      return [null, "No se encontraron usuarios que coincidan con los criterios de búsqueda"];
    }

    const usersData = users.map(({ password, ...user }) => user); // Exclude the password field from each user
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
        if (!users || users.length === 0) return [null, "No se encontraron usuarios"];
        
        // Retornar todos los usuarios encontrados
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

        if (!users || users.length === 0) return [null, "No se encontraron usuarios"];

        const usersData = users.map(({ password, ...user }) => user); // Exclude the password field from each user
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
      return [null, "Solo se permite actualizar el rol del usuario"];
    }

    /* The type system will automatically validate that the role is valid thanks to userRole type */
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

    const userFound = await userRepository.findOne({
      where: [{ id }, { rut }, { email }],
    });

    if (!userFound) return [null, "Usuario no encontrado"];

    /* Prohibit if the requester is not admin */
    if (requester.role !== "Administrador") {
      return [null, "No tienes permisos para eliminar usuarios"];
    }
    /* Prohibit if the user to be deleted is admin */
    if (userFound.role === "Administrador" && requester.role !== "Administrador") {
      return [null, "No tienes permisos para eliminar este usuario"];
    }

    const userDeleted = await userRepository.remove(userFound);

    const { password, ...dataUser } = userDeleted; // Exclude the password field
    return [dataUser, null];
  }
  catch (error) {
    console.error("Error al eliminar un usuario:", error);
    return [null, "Error interno del servidor"];
  }
}