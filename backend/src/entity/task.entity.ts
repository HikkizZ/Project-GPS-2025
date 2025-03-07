"use strict";

import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, In } from "typeorm";
import { User } from "./user.entity.js";
import { taskPriority, taskStatus } from "../../types.js";

@Index(["status", "createdAt"]) // Index for the status and createdAt columns
@Entity("task") // Table name
export class Task {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 255, nullable: false })
    title!: string;

    @Column({ type: "text", nullable: false })
    description!: string;

    @Column({ type: "enum", enum: ["Pendiente", "En Proceso", "Finalizada", "Cancelada"], default: "Pendiente", nullable: false })
    status!: taskStatus;

    @Column({ type: "enum", enum: ["Alta", "Media", "Baja"], default: "Media",nullable: false })
    priority!: taskPriority;

    @Column({ type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP", nullable: false })
    createAt!: Date;

    @Column({ type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP", onUpdate:"CURRENT_TIMESTAMP", nullable: false })
    updateAt!: Date;

    /* User relation */
    @ManyToOne(() => User, (user) => user.tasks)
    user!: User;    
}