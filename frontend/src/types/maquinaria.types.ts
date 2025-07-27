// Importar tipos de stakeholders desde la ubicación correcta
import type { Supplier } from "./stakeholders/supplier.types"
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
  // Relaciones opcionales
  compras?: CompraMaquinaria[]
  ventas?: VentaMaquinaria[]
}

export interface CompraMaquinaria {
  id: number
  maquinariaId?: number
  maquinaria_id?: number
  patente: string
  grupo: GrupoMaquinaria
  marca: string
  modelo: string
  anio: number // Cambiado de 'año' a 'anio' para coincidir con backend
  fechaCompra: string
  valorCompra: number
  avaluoFiscal: number
  numeroChasis: string
  kilometrajeInicial: number
  // Relación con Supplier
  supplierId?: number
  supplierRut?: string
  proveedor?: string // Nombre del supplier (desnormalizado)
  observaciones?: string
  // Campos del padrón agregados
  padronUrl?: string
  padronFilename?: string
  padronFileType?: "image" | "pdf"
  padronOriginalName?: string
  padronFileSize?: number
  fechaCreacion: string
  fechaActualizacion: string
  // Campo para soft delete
  isActive?: boolean
  maquinaria?: Maquinaria
  supplier?: Supplier
}

export interface VentaMaquinaria {
  id: number
  maquinariaId: number
  patente: string
  fechaVenta: string
  valorCompra: number
  valorVenta: number
  // Relación con Customer
  customerId: number
  customerRut: string
  comprador?: string // Nombre del customer (desnormalizado)
  observaciones?: string
  // Campo para soft delete
  isActive?: boolean
  maquinaria?: Maquinaria
  customer?: Customer
}

export interface CreateCompraMaquinaria {
  patente: string
  grupo: GrupoMaquinaria
  marca: string
  modelo: string
  anio: number // Cambiado de 'año' a 'anio'
  fechaCompra: string
  valorCompra: number
  avaluoFiscal: number
  numeroChasis: string
  kilometrajeInicial: number
  supplierId?: number // Cambiar de proveedor a supplierId
  observaciones?: string
}

export interface CreateVentaMaquinaria {
  patente: string
  fechaVenta: string
  valorCompra: number
  valorVenta: number
  customerId: number // Cambiar de comprador a customerId
  observaciones?: string
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  error?: string
}
