import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    JoinColumn
} from "typeorm";
import { Trabajador } from "./trabajador.entity.js";

@Entity("capacitaciones")
export class Capacitacion {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Trabajador, trabajador => trabajador.capacitaciones, { nullable: false })
    @JoinColumn({ name: "trabajadorId" })
    trabajador!: Trabajador;

    @Column({ type: "varchar", length: 200, nullable: false })
    nombreCurso!: string;

    @Column({ type: "varchar", length: 200, nullable: false })
    institucion!: string;

    @Column({ type: "date", nullable: false })
    fecha!: Date;

    @Column({ type: "varchar", length: 50, nullable: false })
    duracion!: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    certificadoURL!: string;

    @CreateDateColumn({ type: "timestamp" })
    fechaRegistro!: Date;
} 