import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { GrupoMaquinaria } from "../maquinaria/maquinaria.entity.js";

@Entity("spare_parts")
export class SparePart {
  @PrimaryGeneratedColumn()
  id!: number;

  // Nombre del repuesto
  @Column({
    type: "varchar",
    length: 255,
    nullable: false
  })
  name!: string;

  // Stock disponible del repuesto
  @Column({
    type: "integer",
    nullable: false
  })
  stock!: number;

  // Marca del repuesto
  @Column({
    type: "varchar",
    length: 100,
    nullable: false
  })
  marca!: string;

  // Modelo del repuesto
  @Column({
    type: "varchar",
    length: 100,
    nullable: false
  })
  modelo!: string;

  // Año del repuesto
  @Column({
    type: "int",
    nullable: false
  })
  anio!: number;

  // Tipo o categoría de maquinaria para la que se usa
  @Column({
    type: "enum",
    enum: GrupoMaquinaria,
    nullable: false
  })
  grupo!: GrupoMaquinaria;
}
