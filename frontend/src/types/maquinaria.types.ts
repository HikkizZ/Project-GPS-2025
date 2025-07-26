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
  proveedor?: string
  observaciones?: string
  // Campos del padrón agregados
  padronUrl?: string
  padronFilename?: string
  padronFileType?: "image" | "pdf"
  padronOriginalName?: string
  padronFileSize?: number
  fechaCreacion: string
  fechaActualizacion: string
  maquinaria?: Maquinaria
}

export interface VentaMaquinaria {
  id: number
  maquinariaId: number
  patente: string
  fechaVenta: string
  valorCompra: number
  valorVenta: number
  comprador?: string
  observaciones?: string
  maquinaria?: Maquinaria
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
  proveedor?: string
  observaciones?: string
}

export interface CreateVentaMaquinaria {
  patente: string
  fechaVenta: string
  valorCompra: number
  valorVenta: number
  comprador?: string
  observaciones?: string
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  error?: string
}
