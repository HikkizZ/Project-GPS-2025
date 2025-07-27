import type { Customer } from "./stakeholders/customer.types"

export enum GrupoMaquinaria {
  CAMION_TOLVA = "camion_tolva",
  BATEA = "batea",
  CAMA_BAJA = "cama_baja",
  PLUMA = "pluma",
  ESCAVADORA = "escavadora",
  RETROEXCAVADORA = "retroexcavadora",
  CARGADOR_FRONTAL = "cargador_frontal",
}

export enum EstadoMaquinaria {
  DISPONIBLE = "disponible",
  EN_ARRIENDO = "en_arriendo",
  EN_MANTENCION = "en_mantencion",
  VENDIDA = "vendida",
  FUERA_DE_SERVICIO = "fuera_de_servicio",
}

export interface Maquinaria {
  id: number
  patente: string
  grupo: GrupoMaquinaria
  marca: string
  modelo: string
  año: number
  numeroChasis: string
  kilometrajeActual: number
  estado: EstadoMaquinaria
  avaluoFiscal: number
  createdAt: string
  updatedAt: string
}

export interface ArriendoMaquinaria {
  id: number
  numeroReporte: string
  patente: string
  marca: string
  modelo: string
  fechaTrabajo: string
  kmFinal: number
  valorServicio: number
  obra: string
  detalle?: string
  // Campos de cliente existentes (mantener como estaban)
  rutCliente: string
  nombreCliente: string
  // Solo agregar el campo para soft delete
  isActive?: boolean
  // Relaciones existentes
  maquinaria?: Maquinaria
  customer?: Customer
}

export interface CreateArriendoMaquinaria {
  numeroReporte: string
  patente: string
  fechaTrabajo: string
  kmFinal: number
  valorServicio: number
  obra: string
  detalle?: string
  // Mantener los campos de cliente como estaban
  rutCliente: string
  nombreCliente: string
}

// Tipo legacy para compatibilidad con el sistema anterior
export interface ClienteMaquinaria {
  id: number
  nombre: string
  rut: string
  telefono?: string
  email?: string
  direccion?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateClienteMaquinaria {
  nombre: string
  rut: string
  telefono?: string
  email?: string
  direccion?: string
}

export interface EstadisticasClienteMaquinaria {
  totalReportes: number
  totalIngresos: number
  ultimoReporte?: string
  promedioMensual: number
}

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
}
