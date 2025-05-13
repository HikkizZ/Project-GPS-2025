import { User } from "../entity/user.entity.js";
import { AppDataSource } from "../config/configDB.js";
import { comparePassword, encryptPassword } from "../helpers/bcrypt.helper.js";
import { userRole } from "../../types.js";

type QueryParams = {
    id?: number;
    email?: string;
    rut?: string;
}

type UpdateBody = {
    name?: string;
    email?: string;
    rut?: string;
    password?: string;
    newPassword?: string;
    role?: string;
}

type UserWithoutPassword = Omit<User, 'password'>; // Exclude the password field from the User type

export async function getUserService(query: QueryParams): Promise<[UserWithoutPassword | null, string | null]> {
    try {
        const { id, email, rut } = query;
        const userRepository = AppDataSource.getRepository(User);

        const userFound = await userRepository.findOne({ where: { id, email, rut } });

        if (!userFound) return [null, "El usuario no existe."];

        const { password, ...userData } = userFound; // Exclude the password field

        return [userData, null];
    } catch (error) {
        console.error("Error in getUserService:", error);
        return [null, "Error interno del servidor."];
    }
}

export async function getUsersService(): Promise<[UserWithoutPassword[] | null, string | null]> {
    try {
        const userRepository = AppDataSource.getRepository(User);
        const users = await userRepository.find();

        if (!users) return [null, "No se encontraron usuarios."];

        const usersData = users.map(({ password, ...user }) => user); // Exclude the password field from each user
        return [usersData, null];
    } catch (error) {
        console.error("Error in getUsersService:", error);
        return [null, "Error interno del servidor."];
    }
}

export async function updateUserService(query: QueryParams, body: UpdateBody): Promise<[UserWithoutPassword | null, string | null]> {
  try {
    const { id, rut, email } = query;
    const userRepository = AppDataSource.getRepository(User);

    const userFound = await userRepository.findOne({
      where: [{ id }, { rut }, { email }],
    });

    if (!userFound) return [null, "Usuario no encontrado"];

    const existingUser = await userRepository.findOne({
      where: [{ rut: body.rut }, { email: body.email }],
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
      role: body.role as userRole,
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

export async function deleteUserService(query: QueryParams, requester: User): Promise<[UserWithoutPassword | null, string | null]> {
  try {
    const { id, rut, email } = query;
    const userRepository = AppDataSource.getRepository(User);

    const userFound = await userRepository.findOne({
      where: [{ id }, { rut }, { email }],
    });

    if (!userFound) return [null, "Usuario no encontrado"];

    if (userFound.role === "Admin" && requester.role !== "Admin") {
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