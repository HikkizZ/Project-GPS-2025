import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn
} from "typeorm";
import { Trabajador } from "./trabajador.entity.js";
import { User } from "../user.entity.js"; // Usuario que revisa (RRHH)

export enum TipoSolicitud {
  LICENCIA = "Licencia médica",
  PERMISO = "Permiso administrativo"
}

export enum EstadoSolicitud {
  PENDIENTE = "Pendiente",
  APROBADA = "Aprobada",
  RECHAZADA = "Rechazada"
}

@Entity("licencias_permisos")
export class LicenciaPermiso {
  @PrimaryGeneratedColumn()
  id!: number;

  // Relación con el trabajador solicitante
  @ManyToOne(() => Trabajador, trabajador => trabajador.licenciasPermisos, { nullable: false })
  @JoinColumn({ name: "trabajadorId" })
  trabajador!: Trabajador;


  @Column({ type: "enum", enum: TipoSolicitud })
  tipo!: TipoSolicitud;

  @Column({ type: "date", nullable: false })
  fechaInicio!: Date;

  @Column({ type: "date", nullable: false })
  fechaFin!: Date;

  @Column({ type: "text", nullable: false })
  motivoSolicitud!: string;

  @Column({ type: "enum", enum: EstadoSolicitud, default: EstadoSolicitud.PENDIENTE })
  estado!: EstadoSolicitud;

  @Column({ type: "text", nullable: true })
  respuestaEncargado!: string;

  // Usuario que revisa la solicitud (RRHH)
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "revisadoPorId" })
  revisadoPor!: User;

  @Column({ type: "varchar", length: 255, nullable: true })
  archivoAdjuntoURL!: string;

  @CreateDateColumn({ type: "timestamp" })
  fechaSolicitud!: Date;
}