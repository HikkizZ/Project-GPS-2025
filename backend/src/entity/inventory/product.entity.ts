import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ProductType } from '../../../types.js';

@Entity("products")
export class Product {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ enum: ProductType, type: 'enum', nullable: false })
    product!: ProductType;

    @Column({ type: 'integer', nullable: false })
    salePrice!: number;
}