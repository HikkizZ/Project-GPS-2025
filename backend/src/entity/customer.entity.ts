import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm";

@Entity("customers")
export class Customer {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 255, nullable: false })
    name!: string;

    @Index("IDX_SUPPLIERS_RUT", { unique: true }) // Unique index for the rut column
    @Column({ type: "varchar", length: 12, nullable: false })
    rut!: string;

    @Column({ type: "varchar", length: 255, nullable: false })
    address!: string;

    @Column({ type: "varchar", length: 12, nullable: false })
    phone!: string;

    @Index("IDX_SUPPLIERS_EMAIL", { unique: true }) // Unique index for the email column
    @Column({ type: "varchar", length: 255, nullable: false })
    email!: string;
}