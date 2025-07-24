import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn
} from 'typeorm';

@Entity('maintenance_spare_parts')
export class MaintenanceSparePart {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'integer',
    nullable: false
  })
  cantidadUtilizada!: number;

  @ManyToOne("spare_parts", { nullable: false })
  @JoinColumn({ name: 'repuestoId' })
  repuesto!: any;

  @ManyToOne("maintenance_records", (mantencion: any) => mantencion.repuestosUtilizados, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mantencionId' })
  mantencion!: any;
}
