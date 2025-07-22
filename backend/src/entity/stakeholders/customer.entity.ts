import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm";

@Entity("customers")
export class Customer {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 255, nullable: false })
    name!: string;

    @Index("IDX_CUSTOMERS_RUT", { unique: true }) // Unique index for the rut column
    @Column({ type: "varchar", length: 12, nullable: false })
    rut!: string;

    @Column({ type: "varchar", length: 255, nullable: false })
    address!: string;

    @Column({ type: "varchar", length: 12, nullable: false })
    phone!: string;

    @Index("IDX_CUSTOMERS_EMAIL", { unique: true }) // Unique index for the email column
    @Column({ type: "varchar", length: 255, nullable: false })
    email!: string;

    @Column({ type: 'boolean', default: true })
    isActive!: boolean;
}
