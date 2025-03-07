"use strict";

import fs from "fs"; // File system module
import path from "path"; // Path module
import { encryptPassword } from "../helpers/bcrypt.helper.js";
import { AppDataSource } from "../config/configDB.js";
import { User } from "../entity/user.entity.js";
import { userRole } from "../../types.js";

export async function initialSetup(): Promise<void> {
    try {
        console.log("=> Initial setup started");

        const userRepository = AppDataSource.getRepository(User);

        // Check if there are users in the database
        const usersCount = await userRepository.count();
        if (usersCount > 0) {
            console.log("✅ There are already users in the database. The initial configuration has been skipped.");
            return;
        }

        // Read the initial data from the JSON file
        const userFilePath = path.resolve("src/data/users.json");
        if (!fs.existsSync(userFilePath)) {
            console.error("❌ The file users.json does not exist.");
            return;
        }

        const usersData = JSON.parse(fs.readFileSync(userFilePath, "utf-8"));

        // Encrypt the password of the users
        const usersToSave = await Promise.all(
            usersData.map(async (user: { name: string; rut: string; email: string; role: userRole; password: string }) => ({
                ...user,
                password: await encryptPassword(user.password)
            }))
        );

        // Save the users in the database
        await userRepository.save(usersToSave);

        console.log("✅ The initial configuration has been completed successfully.");
    } catch (error) {
        console.error("❌ Error in the initial configuration: ", error);
    }
}