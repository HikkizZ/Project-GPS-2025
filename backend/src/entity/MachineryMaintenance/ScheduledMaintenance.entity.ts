import { Entity, PrimaryGeneratedColumn, Column, ManyToOne} from "typeorm"
import { Maquinaria } from "../maquinaria/maquinaria.entity.js"

//? Mantenciones por realizar: Si la maquina necesita mantenfción y está pendiente, aquí se debe registrar
//? Junto con la fecha que se hará mantención, el problema que se encontró y si la mantención fue realizada

@Entity("scheduled_maintenance")
export class ScheduledMaintenance{

    @PrimaryGeneratedColumn()
    id!: number

//!Se podría eliminar
    @Column({
        
        type: "date",
        nullable: false

    })
    scheduleDate!: Date

//?Problema detectado
    @Column({
        type: "varchar",
        length: 255,
        nullable: false
    })
    task!: string

//?Estado en que se encuentra
    @Column({
        type: "boolean",
        default: false,
        nullable: false
    })
    completed!: boolean

    @ManyToOne(() => Maquinaria)
    maquinaria!: Maquinaria

} 