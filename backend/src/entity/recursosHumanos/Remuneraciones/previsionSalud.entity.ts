import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany
} from "typeorm";

export enum TipoPrevisionSalud {
    ISAPRE = "ISAPRE",
    FONASA = "FONASA"
}

@Entity ("prevision_salud")
export class PrevisionSalud {
    @PrimaryGeneratedColumn()
    id!: number;

    @OneToMany("datosPrevisionalesTrabajadores", (asignacion: any)=> asignacion.salud)
        asignacionesS!: any;

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
    comision!: number;

}