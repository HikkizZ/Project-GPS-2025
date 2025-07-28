/*
    --- En esta entidad se dará registro de todas las maquinas que entrarán en mantención, ---
    --- las razones por la cual entraron, la fecha de registro.
*/
import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn
} from 'typeorm';

import { Maquinaria } from '../maquinaria/maquinaria.entity.js';
import { MaintenanceSparePart } from './maintenanceSparePart.entity.js';
import { User } from '../user.entity.js'; 

//? Los estados que se asiganará a la máquina cuando sea registrada, cuando esté en espera, cuando se compiencé la reparación, cuando se finalice la manención o cuando se pase a mejor vida
export enum EstadoMantencion {
  PENDIENTE = 'pendiente',
  EN_PROCESO = 'en_proceso',
  COMPLETADA = 'completada',
  IRRECUPERABLE = 'irrecuperable'
}

//? Las razones por la cual la máquima entró en mantención
export enum RazonMantencion {
  KILOMETRAJE = 'kilometraje',
  RUTINA = 'rutina',
  FALLA = 'falla'
}

@Entity('maintenance_records')
export class MaintenanceRecord {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Maquinaria, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'maquinariaId' })
  maquinaria!: Maquinaria;

  @CreateDateColumn()
  fechaEntrada!: Date;

  @Column({ type: 'timestamp', nullable: true })
  fechaSalida!: Date | null;

  @Column({
    type: 'enum',
    enum: EstadoMantencion,
    default: EstadoMantencion.PENDIENTE
  })
  estado!: EstadoMantencion;

  @Column({
    type: 'enum',
    enum: RazonMantencion
  })
  razonMantencion!: RazonMantencion;

  @Column({ type: 'text' })
  descripcionEntrada!: string;

  @Column({ type: 'text', nullable: true })
  descripcionSalida!: string | null;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'mecanicoId' })
  mecanicoAsignado!: User;

  @OneToMany(() => MaintenanceSparePart, repuesto => repuesto.mantencion, { cascade: true })
  repuestosUtilizados!: MaintenanceSparePart[];



}
