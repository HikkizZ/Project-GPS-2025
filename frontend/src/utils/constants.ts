// Estados de trabajadores
export const TRABAJADOR_ESTADOS = {
  ACTIVO: 'ACTIVO',
  INACTIVO: 'INACTIVO',
  LICENCIA: 'LICENCIA',
  VACACIONES: 'VACACIONES'
} as const;

export const TRABAJADOR_ESTADOS_LABELS = {
  [TRABAJADOR_ESTADOS.ACTIVO]: 'Activo',
  [TRABAJADOR_ESTADOS.INACTIVO]: 'Inactivo',
  [TRABAJADOR_ESTADOS.LICENCIA]: 'En Licencia',
  [TRABAJADOR_ESTADOS.VACACIONES]: 'En Vacaciones'
} as const;

// Estados de fichas de empresa
export const FICHA_EMPRESA_ESTADOS = {
  ACTIVO: 'ACTIVO',
  INACTIVO: 'INACTIVO',
  SUSPENDIDO: 'SUSPENDIDO'
} as const;

export const FICHA_EMPRESA_ESTADOS_LABELS = {
  [FICHA_EMPRESA_ESTADOS.ACTIVO]: 'Activo',
  [FICHA_EMPRESA_ESTADOS.INACTIVO]: 'Inactivo',
  [FICHA_EMPRESA_ESTADOS.SUSPENDIDO]: 'Suspendido'
} as const;

// Tipos de licencias
export const LICENCIA_TIPOS = {
  MEDICA: 'MEDICA',
  MATERNAL: 'MATERNAL',
  PATERNAL: 'PATERNAL',
  VACACIONES: 'VACACIONES',
  PERMISO: 'PERMISO',
  OTRO: 'OTRO'
} as const;

export const LICENCIA_TIPOS_LABELS = {
  [LICENCIA_TIPOS.MEDICA]: 'Médica',
  [LICENCIA_TIPOS.MATERNAL]: 'Maternal',
  [LICENCIA_TIPOS.PATERNAL]: 'Paternal',
  [LICENCIA_TIPOS.VACACIONES]: 'Vacaciones',
  [LICENCIA_TIPOS.PERMISO]: 'Permiso',
  [LICENCIA_TIPOS.OTRO]: 'Otro'
} as const;

// Roles de usuario
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  RH: 'RH',
  SUPERVISOR: 'SUPERVISOR',
  TRABAJADOR: 'TRABAJADOR'
} as const;

export const USER_ROLES_LABELS = {
  [USER_ROLES.ADMIN]: 'Administrador',
  [USER_ROLES.RH]: 'Recursos Humanos',
  [USER_ROLES.SUPERVISOR]: 'Supervisor',
  [USER_ROLES.TRABAJADOR]: 'Trabajador'
} as const;

// Tipos de archivos permitidos
export const ALLOWED_FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  SPREADSHEETS: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  ALL: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
} as const;

// Tamaños máximos de archivos (en MB)
export const MAX_FILE_SIZES = {
  IMAGE: 5,
  DOCUMENT: 10,
  SPREADSHEET: 10,
  DEFAULT: 5
} as const;

// Configuración de paginación
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100],
  MAX_PAGES_TO_SHOW: 5
} as const;

// Configuración de búsqueda
export const SEARCH_CONFIG = {
  MIN_CHARS: 2,
  DEBOUNCE_DELAY: 300,
  MAX_RESULTS: 100
} as const;

// Configuración de notificaciones
export const NOTIFICATION_CONFIG = {
  AUTO_HIDE_DELAY: 5000,
  POSITION: 'top-right',
  MAX_NOTIFICATIONS: 5
} as const;

// Configuración de validación
export const VALIDATION_CONFIG = {
  RUT_MIN_LENGTH: 8,
  RUT_MAX_LENGTH: 12,
  PHONE_MIN_LENGTH: 8,
  PHONE_MAX_LENGTH: 15,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  EMAIL_MAX_LENGTH: 100,
  ADDRESS_MAX_LENGTH: 200
} as const;

// Configuración de fechas
export const DATE_CONFIG = {
  DEFAULT_FORMAT: 'DD/MM/YYYY',
  DATETIME_FORMAT: 'DD/MM/YYYY HH:mm',
  TIME_FORMAT: 'HH:mm',
  LOCALE: 'es-CL',
  TIMEZONE: 'America/Santiago'
} as const;

// Configuración de moneda
export const CURRENCY_CONFIG = {
  DEFAULT: 'CLP',
  SYMBOL: '$',
  LOCALE: 'es-CL',
  DECIMAL_PLACES: 0
} as const;

// Configuración de rutas
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  TRABAJADORES: '/trabajadores',
  FICHAS_EMPRESA: '/fichas-empresa',
  HISTORIAL_LABORAL: '/historial-laboral',
  LICENCIAS_PERMISOS: '/licencias-permisos',
  USERS: '/users',
  CUSTOMERS: '/customers',
  SUPPLIERS: '/suppliers',
  PRODUCTS: '/products',
  INVENTORY: '/inventory'
} as const;

// Configuración de colores para estados
export const STATUS_COLORS = {
  SUCCESS: '#28a745',
  WARNING: '#ffc107',
  DANGER: '#dc3545',
  INFO: '#17a2b8',
  PRIMARY: '#007bff',
  SECONDARY: '#6c757d',
  LIGHT: '#f8f9fa',
  DARK: '#343a40'
} as const;

// Configuración de iconos
export const ICONS = {
  SUCCESS: 'bi-check-circle',
  WARNING: 'bi-exclamation-triangle',
  DANGER: 'bi-x-circle',
  INFO: 'bi-info-circle',
  EDIT: 'bi-pencil',
  DELETE: 'bi-trash',
  VIEW: 'bi-eye',
  ADD: 'bi-plus',
  SEARCH: 'bi-search',
  FILTER: 'bi-funnel',
  SORT: 'bi-sort-down',
  DOWNLOAD: 'bi-download',
  UPLOAD: 'bi-upload',
  PRINT: 'bi-printer',
  EXPORT: 'bi-file-earmark-arrow-down',
  IMPORT: 'bi-file-earmark-arrow-up'
} as const; 