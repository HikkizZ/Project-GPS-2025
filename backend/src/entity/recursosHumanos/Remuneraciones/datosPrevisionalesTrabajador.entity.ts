import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn
} from "typeorm";
import { Trabajador } from "../trabajador.entity.js";
import { PrevisionAFP } from "./previsionAFP.entity.js";
import { PrevisionSalud } from "./previsionSalud.entity.js";

@Entity("datosPrevisionalesTrabajadores")
export class DatosPrevisionalesTrabajador {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Trabajador, trabajador => trabajador.datosPrevisionales, { nullable: false })
    trabajador!: Trabajador;

    @ManyToOne(() => PrevisionAFP, afp => afp.asignacionesA, { nullable: false })
    afp!: PrevisionAFP;

    @ManyToOne(() => PrevisionSalud, salud => salud.asignacionesS, { nullable: false })
    salud!: PrevisionSalud;

    @Column({ type: "varchar", length: 50, nullable: true })
    seguroCesantia!: string;

    @Column({ type: 'date' })
    fechaInicio: Date;

    @Column({ type: 'date', nullable: true })
    fechaFin: Date; // null = aún vigente

}