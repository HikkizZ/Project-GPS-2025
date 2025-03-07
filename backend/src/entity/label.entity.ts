"use strict";

import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, ManyToOne, JoinTable } from "typeorm";
import { User } from "./user.entity.js";
import { Task } from "./task.entity.js";

@Entity("labels") // Table name
export class Label {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 255, nullable: false })
    name!: string;

    @ManyToOne(() => User, (user) => user.labels)
    user!: User;

    @ManyToMany(() => Task, (task) => task.labels)
    @JoinTable()
    tasks!: Task[];
}
