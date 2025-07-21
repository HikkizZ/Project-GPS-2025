import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne
} from "typeorm";
import { FichaEmpresa } from "../fichaEmpresa.entity.js";
import { Bono } from "./Bono.entity.js";

@Entity("asignar_bono")
export class AsignarBono {
    @PrimaryGeneratedColumn()
        id!: number;

    //Relación con la ficha del trabajador al que se le asigna el bono
    @ManyToOne(() => FichaEmpresa, fichaEmpresa => fichaEmpresa.asignacionesBonos, { nullable: true })
        fichaEmpresa!: FichaEmpresa;
        
    // Relación con el bono asignado
    @ManyToOne(() => Bono, bono => bono.asignaciones, { nullable: false })
        bono!: Bono;

    // Fecha de asignación del bono
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
        fechaAsignacion!: Date;

    // Fecha de fin de la asignación del bono
    @Column({ 
        type: "date", 
        nullable: true,
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
    fechaFinAsignacion!: Date | null;

    // Estado de la asignación del bono, de no estar activa la asignación no se considerará para el cálculo de remuneraciones pero se considera para el historial del trabajador
    @Column({ type: "boolean", default: true })
        activo!: boolean;

    // Observaciones adicionales sobre la asignación del bono en caso de que sea necesario
    @Column({ type: "text", nullable: true })
        observaciones?: string;
}