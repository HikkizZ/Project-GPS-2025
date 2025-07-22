import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn
} from 'typeorm';

import { SparePart } from '../MachineryMaintenance/SparePart.entity.js';
import { MaintenanceRecord } from './maintenanceRecord.entity.js';

@Entity('maintenance_spare_parts')
export class MaintenanceSparePart {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'integer',
    nullable: false
  })
  cantidadUtilizada!: number;

  @ManyToOne(() => SparePart, { nullable: false })
  @JoinColumn({ name: 'repuestoId' })
  repuesto!: SparePart;

  @ManyToOne(() => MaintenanceRecord, mantencion => mantencion.repuestosUtilizados, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mantencionId' })
  mantencion!: MaintenanceRecord;
}
