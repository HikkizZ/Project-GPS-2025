import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"

@Entity("clientes_maquinaria")
export class ClienteMaquinaria {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: "varchar", length: 12, nullable: false, unique: true })
  rut!: string

  @Column({ type: "varchar", length: 255, nullable: false })
  nombre!: string

  @Column({ type: "varchar", length: 15, nullable: true })
  telefono!: string

  @Column({ type: "varchar", length: 255, nullable: true })
  email!: string

  @Column({ type: "text", nullable: true })
  direccion!: string

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
