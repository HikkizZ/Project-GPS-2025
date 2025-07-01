import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { Maquinaria } from "../maquinaria/maquinaria.entity.js"
import { number } from "joi"

//? Repuestos: Su función es tener el nombre de los respuestos y la cantidad disponible 

@Entity("spare_parts")
export class SparePart {

    @PrimaryGeneratedColumn()
    id!: number

//?Nombre del respuesto
    @Column({

        type: "varchar",
        length: 255,
        nullable: false
    })
    name!: string

//?Cantidad de repuesto disponible
    @Column({
        type: "integer",
        nullable: false

    })
    stock!: number


    @ManyToOne(() => Maquinaria)
    maquinaria!: Maquinaria
}