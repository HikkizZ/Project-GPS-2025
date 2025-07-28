export const REMOTE_SERVER_CONFIG = {
  host: "146.83.198.35",
  port: 1219, // Puerto SSH del servidor de archivos
  username: "fmiranda",
  password: "U@er7", // Contraseña del servidor de archivos
  uploadPath: "/var/www/html/uploads",
  baseUrl: "http://146.83.198.35:1220/uploads", // Puerto Apache del servidor de archivos
  maxRetries: 3,
  timeout: 30000,
}

export const ALLOWED_FILE_TYPES = {
  images: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
}

export const FILE_LIMITS = {
  maxSize: 25 * 1024 * 1024, // 25MB
}

export const MODULE_FOLDERS = {
  maquinaria: "maquinaria",
  empleados: "empleados",
  contratos: "contratos",
  licencias: "licencias",
  historial: "historial",
  general: "general",
} as const

export type ModuleFolder = keyof typeof MODULE_FOLDERS

// Configuración para desarrollo local
export const LOCAL_SERVER_CONFIG = {
  uploadPath: "./uploads", // Carpeta local para desarrollo
  baseUrl: "http://localhost:3000/uploads", // URL local para servir archivos
}

// Detectar entorno
export const isDevelopment = process.env.NODE_ENV === "development" || process.env.NODE_ENV === undefined
export const isProduction = process.env.NODE_ENV === "production"

// Configuración activa según entorno
export const ACTIVE_CONFIG = isDevelopment ? LOCAL_SERVER_CONFIG : REMOTE_SERVER_CONFIG
