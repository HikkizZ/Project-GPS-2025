import { Entity, PrimaryGeneratedColumn, Column, ManyToOne} from "typeorm"
import { Maquinaria } from "../maquinaria/maquinaria.entity.js"

//? Historial de Mantenciones: Su función es que tenga un registro de las cantidad de veces que ha estado en
//? Mantención la maquinaría, junto con las fechas el cuál a estado, el costo, el nombre del mecánico y una breve descripción

@Entity("maintenance_history")
export class MaintenanceHistory{

    @PrimaryGeneratedColumn()
    id!: number

//?Se registra la o las fechas que se ha estado en mantención

    @Column({
        type: "date",
        nullable: false
    })
    date!: Date

//?Descripción de la mantenciones realizadas
    @Column({
        type: "text",
        nullable: false
    })
    description!: string

//?Registro del costo de la manteicón
    @Column({
        type: "decimal",
        precision: 10,
        scale: 2,
        nullable: false,
    })
    cost!: number

//?Registrar el mecánico encargado de la matención
    @Column({
        type: "varchar",
        length: 200,
        nullable: false,
    })
    responsibleMechanic!: string

    @ManyToOne(() => Maquinaria)
    maquinaria!: Maquinaria
}