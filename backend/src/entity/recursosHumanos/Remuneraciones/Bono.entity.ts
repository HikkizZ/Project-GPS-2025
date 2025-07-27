
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    JoinColumn
} from "typeorm";
import { AsignarBono } from "./asignarBono.entity.js";
export enum tipoBono {
    estatal = "estatal",
    empresarial = "empresarial"
}

export enum temporalidad {
    permanente = "permanente",
    recurrente = "recurrente",
    puntual = "puntual"
}

@Entity("bonos")
export class Bono {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 50, nullable: false })
    nombreBono!: string;

    @Column({ type: "varchar", length: 10, nullable: false })
    monto!: string;

    @Column({ type: "enum", enum: tipoBono })
    tipoBono!: tipoBono;

    @Column({ type: "enum", enum: temporalidad })
    temporalidad!: temporalidad;

    @Column({ type: "text", nullable: true })
    descripcion?: string;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    fechaCreacion!: Date;

    @Column({ type: "boolean", default: true })
    imponible!: boolean;

    @Column({ type: "int", nullable: true })
    duracionMes?: number;

    @OneToMany(() => AsignarBono, asignacion => asignacion.bono)
    asignaciones!: AsignarBono[];

    @Column({ type: "boolean", default: true })
    enSistema!: boolean;    
}
