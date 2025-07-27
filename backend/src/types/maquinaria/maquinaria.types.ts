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
  ARRENDADA = "arrendada",
  MANTENIMIENTO = "mantenimiento",
  FUERA_SERVICIO = "fuera_servicio",
}

// Interfaces base actualizadas con padronUrl
export interface Maquinaria {
  id: number
  patente: string
  grupo: GrupoMaquinaria
  marca: string
  modelo: string
  anio: number
  estado: EstadoMaquinaria
  padronUrl?: string // Nuevo campo
  isActive: boolean
  fechaCreacion: Date
  fechaActualizacion: Date
}

export interface CompraMaquinaria {
  id: number
  patente: string
  grupo: GrupoMaquinaria
  marca: string
  modelo: string
  anio: number
  fechaCompra: string
  valorCompra: number
  avaluoFiscal: number
  numeroChasis: string
  kilometrajeInicial: number
  supplierId?: number
  supplierRut?: string
  proveedor?: string
  observaciones?: string
  padronUrl?: string
  isActive: boolean
  fechaCreacion: Date
  fechaActualizacion: Date
  maquinaria?: Maquinaria
  maquinaria_id?: number
}

export interface VentaMaquinaria {
  id: number
  patente: string
  grupo: GrupoMaquinaria
  marca: string
  modelo: string
  anio: number
  fechaVenta: string
  valorVenta: number
  customerId: number
  customerRut: string
  comprador: string
  observaciones?: string
  isActive: boolean
  fechaCreacion: Date
  fechaActualizacion: Date
  maquinaria?: Maquinaria
  maquinaria_id?: number
}

export interface Conductor {
  id: number
  rut: string
  nombre: string
  apellido: string
  telefono?: string
  email?: string
  licenciaConducir: string
  fechaVencimientoLicencia: string
  isActive: boolean
  fechaCreacion: Date
  fechaActualizacion: Date
}

// Tipos para crear/actualizar (isActive se maneja internamente)
export interface CreateMaquinaria {
  patente: string
  grupo: GrupoMaquinaria
  marca: string
  modelo: string
  anio: number
  estado?: EstadoMaquinaria
  padronUrl?: string // Nuevo campo
}

export interface UpdateMaquinaria {
  patente?: string
  grupo?: GrupoMaquinaria
  marca?: string
  modelo?: string
  anio?: number
  estado?: EstadoMaquinaria
  padronUrl?: string // Nuevo campo
}

export interface CreateCompraMaquinaria {
  patente: string
  grupo: GrupoMaquinaria
  marca: string
  modelo: string
  anio: number
  fechaCompra: string
  valorCompra: number
  avaluoFiscal: number
  numeroChasis: string
  kilometrajeInicial?: number
  supplierRut?: string
  supplierId?: number
  proveedor?: string
  observaciones?: string
  padronUrl?: string
}

export interface UpdateCompraMaquinaria {
  patente?: string
  grupo?: GrupoMaquinaria
  marca?: string
  modelo?: string
  anio?: number
  fechaCompra?: string
  valorCompra?: number
  avaluoFiscal?: number
  numeroChasis?: string
  kilometrajeInicial?: number
  supplierRut?: string
  supplierId?: number
  proveedor?: string
  observaciones?: string
  padronUrl?: string | undefined
}

// Nuevos tipos para el servicio
export interface CreateCompraMaquinariaData extends CreateCompraMaquinaria {
  maquinaria_id?: number
  isActive?: boolean
}

export interface UpdateCompraMaquinariaData extends UpdateCompraMaquinaria {
  maquinaria_id?: number
}

export interface CreateVentaMaquinaria {
  patente: string
  fechaVenta: Date
  valorCompra: number
  valorVenta: number
  customerRut: string
  observaciones?: string
}

export interface UpdateVentaMaquinaria {
  patente?: string
  grupo?: GrupoMaquinaria
  marca?: string
  modelo?: string
  anio?: number
  fechaVenta?: string
  valorVenta?: number
  customerRut?: string
  observaciones?: string
}

export interface CreateConductor {
  rut: string
  nombre: string
  apellido: string
  telefono?: string
  email?: string
  licenciaConducir: string
  fechaVencimientoLicencia: string
}

export interface UpdateConductor {
  rut?: string
  nombre?: string
  apellido?: string
  telefono?: string
  email?: string
  licenciaConducir?: string
  fechaVencimientoLicencia?: string
}

// Tipos para filtros y paginación
export interface FiltrosMaquinaria {
  page?: number
  limit?: number
  search?: string
  grupo?: string
  estado?: string
  fechaInicio?: string
  fechaFin?: string
  incluirInactivas?: boolean
}

export interface FiltrosCompra {
  page?: number
  limit?: number
  search?: string
  grupo?: string
  fechaInicio?: string
  fechaFin?: string
  incluirInactivas?: boolean
}

export interface FiltrosVenta {
  page?: number
  limit?: number
  search?: string
  grupo?: string
  fechaInicio?: string
  fechaFin?: string
  incluirInactivas?: boolean
}

export interface FiltrosArriendo {
  page?: number
  limit?: number
  search?: string
  estadoPago?: string
  fechaInicio?: string
  fechaFin?: string
  maquinaria_id?: number
  conductor_id?: number
  incluirInactivas?: boolean
}

export interface PaginationResult<T> {
  data: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

// Tipos para respuestas de API
export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  error?: string
  errors?: any[]
}

export interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Tipos para Excel export
export interface ExcelExportData {
  filename: string
  data: any[]
  headers: string[]
}

// Tipos para upload de archivos
export interface FileUploadInfo {
  url: string
  filename: string
  fileType: "image" | "pdf"
  originalName: string
  size: number
}
