import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from "typeorm"
import { Maquinaria } from "./maquinaria.entity.js"

export enum TipoLicencia {
  A1 = "a1",
  A2 = "a2",
  A3 = "a3",
  A4 = "a4",
  A5 = "a5",
  B = "b",
  C = "c",
  D = "d",
  E = "e",
  F = "f",
}

@Entity("conductores")
export class Conductor {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: "varchar", length: 20, nullable: false, unique: true })
  rut!: string

  @Column({ type: "varchar", length: 100, nullable: false })
  nombre!: string

  @Column({
    type: "enum",
    enum: TipoLicencia,
    nullable: false,
  })
  tipoLicencia!: TipoLicencia

  @Column({ type: "date", nullable: false })
  fechaNacimiento!: Date

  // Edad calculada automáticamente (no se almacena en la base de datos)
  get edad(): number {
    const hoy = new Date()
    const nacimiento = new Date(this.fechaNacimiento)
    let edad = hoy.getFullYear() - nacimiento.getFullYear()
    const mes = hoy.getMonth() - nacimiento.getMonth()

    // Si aún no ha cumplido años en este año
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--
    }

    return edad
  }

  // Relación con Maquinaria (muchos a muchos)
  @ManyToMany(() => Maquinaria)
  @JoinTable({
    name: "conductor_maquinaria",
    joinColumn: { name: "conductor_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "maquinaria_id", referencedColumnName: "id" },
  })
  maquinarias!: Maquinaria[]
}