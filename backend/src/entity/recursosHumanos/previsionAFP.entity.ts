import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn
} from "typeorm";

import { DatosPrevisionalesTrabajador } from "./datosPrevisionalesTrabajador.entity.js";

export enum TipoAFP {
    AFP = "AFP",
    ISAPRE = "ISAPRE",
    INP = "INP",
    OTRO = "Otro"
}

@Entity("prevision_afp")
export class PrevisionAFP {
    @PrimaryGeneratedColumn()
    id!: number;

    @OneToOne(() => DatosPrevisionalesTrabajador, datosPrevisionales => datosPrevisionales.idAFP, { nullable: false })
    @JoinColumn({ name: "datosPrevisionalesId" })

    @Column({ type: "enum", enum: TipoAFP, default: TipoAFP.AFP })
    tipo!: TipoAFP;

    @Column({ 
    type: "integer", 
    nullable: true,
    transformer: {
      to: (value: number | null): number => {
        return value === null ? 0 : Math.round(value);
      },
      from: (value: string | number | null): number => {
        if (value === null) return 0;
        return typeof value === 'string' ? parseInt(value) : value;
      }
    },
    default: 0
    })
    descuento!: string;

}