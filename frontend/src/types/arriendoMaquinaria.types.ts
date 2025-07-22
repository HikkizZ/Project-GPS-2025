// Tipos actualizados para el nuevo flujo de reportes de trabajo
export interface ArriendoMaquinaria {
  id: number
  numeroReporte: string
  maquinariaId: number
  patente: string
  marca: string
  modelo: string
  rutCliente: string
  nombreCliente: string
  obra: string
  detalle?: string
  kmFinal: number
  valorServicio: number
  fechaTrabajo: string
  createdAt: string
  updatedAt: string
  // Relación con maquinaria
  maquinaria?: {
    id: number
    patente: string
    marca: string
    modelo: string
    grupo: string
    estado: string
    kilometrajeActual: number
    kilometrajeInicial: number
  }
}

export interface CreateArriendoMaquinaria {
  numeroReporte: string
  patente: string
  rutCliente: string
  nombreCliente: string
  obra: string
  detalle?: string
  kmFinal: number
  valorServicio: number
  fechaTrabajo: string
}

// Usar los mismos tipos que en ventas para maquinaria
export interface Maquinaria {
  id: number
  patente: string
  marca: string
  modelo: string
  grupo: string
  estado: string
  kilometrajeActual: number
  kilometrajeInicial: number
}

export interface ClienteMaquinaria {
  id: number
  rut: string
  nombre: string
  telefono?: string
  email?: string
  direccion?: string
  createdAt?: string
  updatedAt?: string
}

// Tipo para crear un nuevo cliente de maquinaria
export interface CreateClienteMaquinaria {
  rut: string
  nombre: string
  telefono?: string
  email?: string
  direccion?: string
}

// Tipo para actualizar un cliente de maquinaria
export interface UpdateClienteMaquinaria {
  rut?: string
  nombre?: string
  telefono?: string
  email?: string
  direccion?: string
}
//clientes

// Tipo para estadísticas de clientes
export interface EstadisticasClienteMaquinaria {
  totalClientes: number
  clientesConTelefono: number
  clientesConEmail: number
}

// Tipo para respuestas de la API
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
}
