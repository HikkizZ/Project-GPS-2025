import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn
} from "typeorm";
import { Trabajador } from "./trabajador.entity.ts";
import { PrevisionAFP } from "./previsionAFP.entity.ts";
import { PrevisionSalud } from "./previsionSalud.entity.ts";

@Entity("datosPrevisionalesTrabajadores")
export class DatosPrevisionalesTrabajador {
    @PrimaryGeneratedColumn()
    id!: number;

    @OneToOne(() => Trabajador, trabajador => trabajador.datosPrevisionales, { nullable: false })
    @JoinColumn({ name: "trabajadorId" })
    rutTrabajador!: Trabajador;

    @OneToOne(() => PrevisionAFP, previsionAFP => previsionAFP.datosPrevisionales, { nullable: false })
    @JoinColumn({ name: "idAFP" })
    idAFP!: string;

    @OneToOne(() => PrevisionSalud, previsionSalud => previsionSalud.datosPrevisionales, { nullable: false })
    @JoinColumn({ name: "idSalud" })
    idSalud!: string;

    @Column({ type: "varchar", length: 50, nullable: true })
    seguroCesantia!: string;

}