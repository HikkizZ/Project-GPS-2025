"use strict";

import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm";
import { userRole } from "../../types.js";

@Entity("userauth") // Table name
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 255, nullable: false })
    name!: string;

    @Index("IDX_USER_RUT", { unique: true }) // Unique index for the rut column
    @Column({ type: "varchar", length: 12, unique: true, nullable: false })
    rut!: string;

    @Index("IDX_USER_EMAIL", { unique: true }) // Unique index for the email column
    @Column({ type: "varchar", length: 255, unique: true, nullable: false })
    email!: string;

    @Column({ type: "varchar", length: 50, nullable: false })
    role!: userRole;

    @Column({ type: "varchar", length: 255, nullable: false })
    password!: string;

    @Column({ type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP", nullable: false })
    createAt!: Date;

    @Column({ type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP", onUpdate:"CURRENT_TIMESTAMP", nullable: false })
    updateAt!: Date;
}