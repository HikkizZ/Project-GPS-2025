import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn} from "typeorm"
import { Maquinaria } from "../maquinaria/maquinaria.entity.js"

//? Registro de fallos: Se deja un registro de los fallos que presenen las maquinas
//? Se anota la fecha del incidente, descripción del problema y en que estado se encuentra

@Entity("failure_reports")
export class FailureReport{

    @PrimaryGeneratedColumn()
    id!:number

    @Column({

        type: "date",
        nullable: false

    })
    date!: Date
//?Descrpción del problema
    @Column({

        type: "varchar",
        length: 255,
        nullable: false

    })
    description!: string


//?Si está arreglado
    @Column({
        type: "boolean",
        default: false,
        nullable: false
    })
    resolved!: boolean

    @ManyToOne(() => Maquinaria, {nullable: false, onDelete: "CASCADE"})
    @JoinColumn({ name: "maquinariaId"})
    maquinaria!: Maquinaria;


} 