import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne
} from "typeorm";
import { Trabajador } from "../trabajador.entity.js";
import { Bono } from "./Bono.entity.js";

@Entity("asignar_bono")
export class AsignarBono {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Trabajador, trabajador => trabajador.asignaciones, { nullable: true })
    trabajador!: Trabajador;

    @ManyToOne(() => Bono, bono => bono.asignaciones, { nullable: false })
    bono!: Bono;

    @Column({ type: "date", nullable: false, default: () => "CURRENT_DATE" })
    fechaEntrega!: Date;

    @Column({ type: "boolean", default: true })
    activo!: boolean;

    @Column({ type: "text", nullable: true })
    observaciones?: string;
}