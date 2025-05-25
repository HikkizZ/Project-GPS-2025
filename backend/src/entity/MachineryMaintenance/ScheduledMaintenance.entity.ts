import { Entity, PrimaryGeneratedColumn, Column, ManyToOne} from "typeorm"
import { Maquinaria } from "../maquinaria/maquinaria.entity.js"

//? Mantenciones por realizar: Si la maquina necesita mantenfción y está pendiente, aquí se debe registrar
//? Junto con la fecha que se hará mantención, el problema que se encontró y si la mantención fue realzada

@Entity("scheduled_maintenance")
export class ScheduledMaintenance{

    @PrimaryGeneratedColumn()
    id!: number

    @Column({
        
        type: "date",
        nullable: false

    })
    scheduleDate!: Date

    @Column({
        type: "varchar",
        length: 255,
        nullable: false
    })
    task!: string

    @Column({
        type: "boolean",
        default: false,
        nullable: false
    })
    completed!: boolean

    @ManyToOne(() => Maquinaria)
    maquinaria!: Maquinaria

} 