import { Entity, PrimaryGeneratedColumn, Column, Index, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { userRole } from "../types/auth.types.js";
import { Trabajador } from "./recursosHumanos/trabajador.entity.js";

@Entity("userauth") // Table name
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 255, nullable: false })
    name: string;

    @Index("IDX_USER_RUT", { unique: true }) // Unique index for the rut column
    @Column({ type: "varchar", length: 12, unique: true, nullable: false })
    rut: string;

    @Index("IDX_USER_EMAIL", { unique: true }) // Unique index for the email column
    @Column({ type: "varchar", length: 255, unique: true, nullable: false })
    email: string;

    @Column({ type: "varchar", length: 50, nullable: false })
    role: userRole;

    @Column({ type: "varchar", length: 255, nullable: false })
    password: string;

    @Column({ type: "varchar", length: 10, default: "Activa" })
    estadoCuenta: string;

    @CreateDateColumn({ type: "timestamp with time zone" })
    createAt: Date;

    @UpdateDateColumn({ type: "timestamp with time zone" })
    updateAt: Date;

    @OneToOne(() => Trabajador)
    @JoinColumn({ name: "rut", referencedColumnName: "rut" })
    trabajador: Trabajador;
}