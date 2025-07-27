export const REMOTE_SERVER_CONFIG = {
  host: "146.83.198.35",
  port: 1219,
  username: "fmiranda",
  password: "U@er7",
  uploadPath: "/var/www/html/uploads",
  baseUrl: "http://146.83.198.35:1220/uploads",
  maxRetries: 3,
  timeout: 30000,
}

export const ALLOWED_FILE_TYPES = {
  images: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
  pdf: ["application/pdf"],
  documents: ["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  extensions: {
    images: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
    pdf: [".pdf"],
    documents: [".doc", ".docx"],
  },
}

export const FILE_LIMITS = {
  maxSize: 25 * 1024 * 1024, // 25MB
  maxFiles: 1,
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
