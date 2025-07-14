import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn
} from "typeorm";

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

  // Relación con Trabajador
  @ManyToOne("Trabajador", "licenciasPermisos", { nullable: false })
  @JoinColumn({ name: "trabajadorId" })
  trabajador!: any;

  @Column({ type: "enum", enum: TipoSolicitud })
  tipo!: TipoSolicitud;

  @Column({ 
    type: "date", 
    nullable: false,
    transformer: {
      to: (value: Date | string | null): string | null => {
        if (!value) return null;
        // Si ya es un string en formato YYYY-MM-DD, mantenerlo así
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
          return value;
        }
        // Si es una fecha válida, convertirla a YYYY-MM-DD
        const date = typeof value === 'string' ? new Date(value) : value;
        if (isNaN(date.getTime())) {
          console.error('Fecha inválida en transformer:', value);
          return null;
        }
        return date.toISOString().split('T')[0];
      },
      from: (value: string | Date | null): Date | null => {
        if (!value) return null;
        if (typeof value === 'string') {
          const [year, month, day] = value.split('-').map(Number);
          return new Date(year, month - 1, day);
        }
        return value;
      }
    }
  })
  fechaInicio!: Date;

  @Column({ 
    type: "date", 
    nullable: false,
    transformer: {
      to: (value: Date | string | null): string | null => {
        if (!value) return null;
        // Si ya es un string en formato YYYY-MM-DD, mantenerlo así
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
          return value;
        }
        // Si es una fecha válida, convertirla a YYYY-MM-DD
        const date = typeof value === 'string' ? new Date(value) : value;
        if (isNaN(date.getTime())) {
          console.error('Fecha inválida en transformer:', value);
          return null;
        }
        return date.toISOString().split('T')[0];
      },
      from: (value: string | Date | null): Date | null => {
        if (!value) return null;
        if (typeof value === 'string') {
          const [year, month, day] = value.split('-').map(Number);
          return new Date(year, month - 1, day);
        }
        return value;
      }
    }
  })
  fechaFin!: Date;

  @Column({ type: "text", nullable: false })
  motivoSolicitud!: string;

  @Column({ type: "enum", enum: EstadoSolicitud, default: EstadoSolicitud.PENDIENTE })
  estado!: EstadoSolicitud;

  @Column({ type: "text", nullable: true })
  respuestaEncargado!: string;

  // Relación con Usuario (quien revisa)
  @ManyToOne("User", { nullable: true })
  @JoinColumn({ name: "revisadoPorId" })
  revisadoPor!: any;

  @Column({ type: "varchar", length: 255, nullable: true })
  archivoAdjuntoURL!: string;

  @CreateDateColumn({ type: "timestamp" })
  fechaSolicitud!: Date;
}