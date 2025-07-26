import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany
} from "typeorm";

export enum TipoFondoAFP {
    A = "A",
    B = "B",
    C = "C",
    D = "D",
    E = "E"
}

@Entity("prevision_afp")
export class PrevisionAFP {
    @PrimaryGeneratedColumn()
    id!: number;

    @OneToMany("datosPrevisionalesTrabajadores", (asignacion: any) => asignacion.afp)
        asignacionesA!: any;

    @Column({ type: "enum", enum: TipoFondoAFP, default: TipoFondoAFP.A })
    tipo!: TipoFondoAFP;

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