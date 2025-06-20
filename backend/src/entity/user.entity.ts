import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from "typeorm";
import { userRole } from "../../types.d.js";
import { Trabajador } from "./recursosHumanos/trabajador.entity.js";
import { formatRut } from "../helpers/rut.helper.js";

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

    @Column({ type: "enum", enum: [
        'SuperAdministrador',
        'Administrador',
        'Usuario',
        'RecursosHumanos',
        'Gerencia',
        'Ventas',
        'Arriendo',
        'Finanzas'
    ], default: 'Usuario' })
    role: userRole;

    @Column({ 
        type: "varchar", 
        length: 20, 
        unique: true,
        transformer: {
            to: (value: string | null): string | null => {
                if (!value) return null;
                return formatRut(value);
            },
            from: (value: string | null): string | null => {
                if (!value) return null;
                return formatRut(value);
            }
        }
    })
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