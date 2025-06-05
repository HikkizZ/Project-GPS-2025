import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from "typeorm";
import { userRole } from "../types/auth.types.js";
import { Trabajador } from "./recursosHumanos/trabajador.entity.js";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 100 })
    name: string;

    @Column({ type: "varchar", length: 100, unique: true })
    email: string;

    @Column({ type: "varchar", length: 100 })
    password: string;

    @Column({ type: "varchar", length: 100, nullable: true })
    originalPassword: string;

    @Column({ type: "enum", enum: userRole, default: userRole.Trabajador })
    role: userRole;

    @Column({ type: "varchar", length: 20, unique: true })
    rut: string;

    @Column({ type: "varchar", length: 50, default: "Activa" })
    estadoCuenta: string;

    @CreateDateColumn()
    createAt: Date;

    @UpdateDateColumn()
    updateAt: Date;

    @OneToOne(() => Trabajador)
    @JoinColumn({ name: "rut", referencedColumnName: "rut" })
    trabajador!: Trabajador;
}