
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

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
    monto!: number;

    @Column({ type: "enum", enum: tipoBono, default: tipoBono.empresarial })
    tipoBono!: tipoBono;

    @Column({ type: "enum", enum: temporalidad, default: temporalidad.puntual })
    temporalidad!: temporalidad;

    @Column({ type: "text", nullable: true })
    descripcion?: string;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    fechaCreacion!: Date;

    @Column({ type: "boolean", default: true })
    imponible!: boolean;

    @OneToMany(() => AsignarBono, asignacion => asignacion.bono)
    asignaciones!: AsignarBono[];
}
