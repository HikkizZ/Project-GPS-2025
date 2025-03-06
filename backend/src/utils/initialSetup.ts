"use strict";

import { User } from "../entity/user.entity.js";
import { AppDataSource } from "../config/configDB.js";
import { encryptPassword } from "../helpers/bcrypt.helper.js";

export async function createUsers(): Promise<void> {
    try {
        const userRepository = AppDataSource.getRepository(User);

        const count: number = await userRepository.count();
        if (count > 0) return;

        await Promise.all([
            userRepository.save(
                userRepository.create({
                    name: "Admin",
                    rut: "11111111-1",
                    email: "user.admin@gmail.cl",
                    password: await encryptPassword("admin2025"),
                    role: "admin"
                })
            ),
            userRepository.save(
                userRepository.create({
                    name: "Felipe Miranda",
                    rut: "20.903.783-1",
                    email: "felipe.miranda@gmail.cl",
                    password: await encryptPassword("felipe2025"),
                    role: "user"
                })
            ),
        ]);
        console.log("=> Users created successfully.");
    } catch (error) {
        console.error("=> Error creating users: ", error);
    }
}