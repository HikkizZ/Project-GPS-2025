"use strict";

import bcrypt from "bcryptjs";

export async function encryptPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, receivedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, receivedPassword);
}
