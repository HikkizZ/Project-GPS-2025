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

// Interfaces base
export interface Maquinaria {
  id: number
  patente: string
  grupo: GrupoMaquinaria
  marca: string
  modelo: string
  anio: number
  estado: EstadoMaquinaria
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
  proveedor?: string
  observaciones?: string
  // Campos del padrón
  padronUrl?: string
  padronFilename?: string
  padronFileType?: "image" | "pdf"
  padronOriginalName?: string
  padronFileSize?: number
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
  comprador: string
  observaciones?: string
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
  fechaCreacion: Date
  fechaActualizacion: Date
}

// Tipos para crear/actualizar
export interface CreateMaquinaria {
  patente: string
  grupo: GrupoMaquinaria
  marca: string
  modelo: string
  anio: number
  estado?: EstadoMaquinaria
}

export interface UpdateMaquinaria {
  patente?: string
  grupo?: GrupoMaquinaria
  marca?: string
  modelo?: string
  anio?: number
  estado?: EstadoMaquinaria
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
  proveedor?: string
  observaciones?: string
  // Campos del padrón (opcionales en creación, se llenan automáticamente)
  padronUrl?: string
  padronFilename?: string
  padronFileType?: "image" | "pdf"
  padronOriginalName?: string
  padronFileSize?: number
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
  proveedor?: string
  observaciones?: string
  // Campos del padrón - permitir undefined para no actualizar
  padronUrl?: string | undefined
  padronFilename?: string | undefined
  padronFileType?: "image" | "pdf" | undefined
  padronOriginalName?: string | undefined
  padronFileSize?: number | undefined
}

// Nuevos tipos para el servicio
export interface CreateCompraMaquinariaData extends CreateCompraMaquinaria {
  maquinaria_id?: number
}

export interface UpdateCompraMaquinariaData extends UpdateCompraMaquinaria {
  maquinaria_id?: number
}

export interface CreateVentaMaquinaria {
  patente: string
  grupo: GrupoMaquinaria
  marca: string
  modelo: string
  anio: number
  fechaVenta: string
  valorVenta: number
  comprador: string
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
  comprador?: string
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
}

export interface FiltrosCompra {
  page?: number
  limit?: number
  search?: string
  grupo?: string
  fechaInicio?: string
  fechaFin?: string
}

export interface FiltrosVenta {
  page?: number
  limit?: number
  search?: string
  grupo?: string
  fechaInicio?: string
  fechaFin?: string
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
