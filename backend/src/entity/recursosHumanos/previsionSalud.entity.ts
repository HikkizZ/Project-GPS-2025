import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn
} from "typeorm";
import { DatosPrevisionalesTrabajador } from "./datosPrevisionalesTrabajador.entity.js";
export enum TipoPrevisionSalud {
    ISAPRE = "ISAPRE",
    FONASA = "FONASA",
    OTRO = "Otro"
}

@Entity ("prevision_salud")
export class PrevisionSalud {
    @PrimaryGeneratedColumn()
    id!: number;

    @OneToOne(() => DatosPrevisionalesTrabajador, datosPrevisionales => datosPrevisionales.idSalud, { nullable: false })
    @JoinColumn({ name: "datosPrevisionalesId" })

    @Column({ type: "enum", enum: TipoPrevisionSalud, default: TipoPrevisionSalud.FONASA })
    tipo!: TipoPrevisionSalud;

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