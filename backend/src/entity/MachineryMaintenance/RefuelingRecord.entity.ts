import { Entity, PrimaryGeneratedColumn, Column, ManyToOne} from "typeorm"
import { Maquinaria } from "../maquinaria/maquinaria.entity.js"

//? Historial de Repostaje: Se deja un registro de las veces que se ha recaragado de combustible

@Entity("refueling_records")
export class RefuelingRecord{

    @PrimaryGeneratedColumn()
    id!: number


//?Se registra la fecha que se a recargado    
    @Column({
        type: "date",
        nullable: false
    })
    date!: Date

//?Se registra los litros de recarga
    @Column({

        type: "decimal",
        precision: 10,
        scale: 2,
        nullable: false

    })
    liters!: number

//?Se registra el costo de la recarga
    @Column({

        type: "decimal",
        precision: 10,
        scale: 2,
        nullable: false

    })
    price!: number
 
    @Column({

        type: "varchar",
        length: 255,
        nullable: false
    })
    operator!: string

    @ManyToOne(() => Maquinaria)
    maquinaria!: Maquinaria

}