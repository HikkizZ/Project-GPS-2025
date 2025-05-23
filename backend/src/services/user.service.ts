import { User } from "../entity/user.entity.js";
import { AppDataSource } from "../config/configDB.js";
import { comparePassword, encryptPassword } from "../helpers/bcrypt.helper.js";
import { userRole, ServiceResponse, QueryParams, UpdateUserData, SafeUser } from '../../types.js';
import { Not } from "typeorm";

/* Obtener usuario por ID, RUT o Email */
export async function getUserService(query: QueryParams): Promise<ServiceResponse<SafeUser>> {
    try {
        const { id, email, rut } = query;
        const userRepository = AppDataSource.getRepository(User);

        const userFound = await userRepository.findOne({ where: [{ id } , { email }, { rut }] });

        if (!userFound) return [null, "El usuario no existe."];

        const { password, ...userData } = userFound; // Exclude the password field

        return [userData, null];
    } catch (error) {
        console.error("Error in getUserService:", error);
        return [null, "Error interno del servidor."];
    }
}

/* Obtener todos los usuarios */
export async function getUsersService(): Promise<ServiceResponse<SafeUser[]>> {
    try {
        const userRepository = AppDataSource.getRepository(User);
        const users = await userRepository.find();

        if (!users || users.length === 0) return [null, "No se encontraron usuarios."];

        const usersData = users.map(({ password, ...user }) => user); // Exclude the password field from each user
        return [usersData, null];
    } catch (error) {
        console.error("Error in getUsersService:", error);
        return [null, "Error interno del servidor."];
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

    /* Only the user or an admin can make changes */
    if (requester.role !== "Administrador" && requester.id !== userFound.id) {
      return [null, "No tienes permisos para modificar a otros usuarios"];
    }

    /* If an attempt is made to change the role, it must be admin */
    if (body.role && requester.role !== "Administrador") {
      return [null, "No tienes permisos para modificar el rol del usuario"];
    }

    const existingUser = await userRepository.findOne({
      where: [
        { rut: body.rut, id: Not(userFound.id) },
        { email: body.email, id: Not(userFound.id) },
        ],
    });

    if (existingUser && existingUser.id !== userFound.id) {
      return [null, "Ya existe un usuario con el mismo rut o email"];
    }

    if (body.password) {
      const matchPassword = await comparePassword(body.password, userFound.password);
      if (!matchPassword) return [null, "La contraseña no coincide"];
    }

    const dataUserUpdate: Partial<User> = {
      name: body.name,
      rut: body.rut,
      email: body.email,
      role: body.role,
      updateAt: new Date(),
    };

    if (body.newPassword?.trim()) {
      dataUserUpdate.password = await encryptPassword(body.newPassword);
    }

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