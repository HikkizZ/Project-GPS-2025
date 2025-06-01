import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn
} from "typeorm";
export enum TipoPrevisionSalud {
    ISAPRE = "ISAPRE",
    FONASA = "FONASA",
    OTRO = "Otro"
}

@entity ("prevision_salud")
export class PrevisionSalud {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 50, nullable: false })
    nombre!: string;

    @Column({ type: "enum", enum: TipoPrevisionSalud, default: TipoPrevisionSalud.FONASA })
    tipo!: TipoPrevisionSalud;

    @Column({ type: "varchar", length: 100, nullable: true })
    plan!: string;

    @Column({ type: "varchar", length: 100, nullable: true })
    telefonoContacto!: string;

    @Column({ type: "varchar", length: 100, nullable: true })
    emailContacto!: string;
}