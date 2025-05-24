import { Entity, PrimaryGeneratedColumn, Column, ManyToOne} from "typeorm"
import { Maquinaria } from "../maquinaria/maquinaria.entity.js"

@Entity("maintenance_history")
export class MaintenanceHistory{

    @PrimaryGeneratedColumn()
    id!: number

    @Column({
        type: "date",
        nullable: false
    })
    date!: Date

    @Column({
        type: "text",
        nullable: false
    })
    description!: string

    @Column({
        type: "decimal",
        precision: 10,
        scale: 2,
        nullable: false,
    })
    cost!: number

    @Column({
        type: "varchar",
        length: 200,
        nullable: false,
    })
    responsibleMechanic!: string

    @ManyToOne(() => Maquinaria)
    maquinaria!: Maquinaria
}