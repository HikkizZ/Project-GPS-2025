import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn
} from "typeorm";
import { Trabajador } from "./trabajador.entity.js";
import { PrevisionAFP } from "./previsionAFP.entity.js";
import { PrevisionSalud } from "./previsionSalud.entity.js";

@Entity("datosPrevisionalesTrabajadores")
export class DatosPrevisionalesTrabajador {
    @PrimaryGeneratedColumn()
    id!: number;

    @OneToOne(() => Trabajador, trabajador => trabajador.rut, { nullable: false })
    @JoinColumn({ name: "trabajadorId" })
    rutTrabajador!: Trabajador;

    @OneToOne(() => PrevisionAFP, previsionAFP => previsionAFP.id, { nullable: false })
    @JoinColumn({ name: "idAFP" })
    idAFP!: string;

    @OneToOne(() => PrevisionSalud, previsionSalud => previsionSalud.id, { nullable: false })
    @JoinColumn({ name: "idSalud" })
    idSalud!: string;

    @Column({ type: "varchar", length: 50, nullable: true })
    seguroCesantia!: string;

}