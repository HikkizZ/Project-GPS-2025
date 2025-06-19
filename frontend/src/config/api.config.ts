export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  TIMEOUT: 10000,
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout'
    },
    USERS: {
      BASE: '/users',
      ALL: '/users/all',
      DETAIL: '/users/detail',
      CREATE: '/users/create',
      UPDATE: '/users/update',
      DELETE: '/users/delete'
    },
    TRABAJADORES: {
      BASE: '/trabajadores',
      ALL: '/trabajadores/all',
      DETAIL: '/trabajadores/detail',
      CREATE: '/trabajadores/create',
      UPDATE: '/trabajadores/update',
      DELETE: '/trabajadores/delete'
    },
    FICHAS_EMPRESA: {
      BASE: '/fichas-empresa',
      ALL: '/fichas-empresa/all',
      DETAIL: '/fichas-empresa/detail',
      CREATE: '/fichas-empresa/create',
      UPDATE: '/fichas-empresa/update',
      DELETE: '/fichas-empresa/delete',
      BY_TRABAJADOR: '/fichas-empresa/trabajador'
    },
    HISTORIAL_LABORAL: {
      BASE: '/historial-laboral',
      ALL: '/historial-laboral/all',
      BY_TRABAJADOR: '/historial-laboral/trabajador',
      CREATE: '/historial-laboral/create',
      UPDATE: '/historial-laboral/update',
      DELETE: '/historial-laboral/delete'
    },
    LICENCIAS_PERMISOS: {
      BASE: '/licencias-permisos',
      ALL: '/licencias-permisos/all',
      BY_TRABAJADOR: '/licencias-permisos/trabajador',
      CREATE: '/licencias-permisos/create',
      UPDATE: '/licencias-permisos/update',
      DELETE: '/licencias-permisos/delete',
      VENCIDAS: '/licencias-permisos/vencidas'
    },
    CUSTOMERS: {
      BASE: '/customers',
      ALL: '/customers/all',
      DETAIL: '/customers/detail',
      CREATE: '/customers/create',
      UPDATE: '/customers/update',
      DELETE: '/customers/delete'
    },
    SUPPLIERS: {
      BASE: '/suppliers',
      ALL: '/suppliers/all',
      DETAIL: '/suppliers/detail',
      CREATE: '/suppliers/create',
      UPDATE: '/suppliers/update',
      DELETE: '/suppliers/delete'
    },
    PRODUCTS: {
      BASE: '/products',
      ALL: '/products/all',
      DETAIL: '/products/detail',
      CREATE: '/products/create',
      UPDATE: '/products/update',
      DELETE: '/products/delete',
      BY_CATEGORY: '/products/category'
    },
    INVENTORY: {
      BASE: '/inventory',
      ENTRY: '/inventory/entry',
      EXIT: '/inventory/exit',
      MOVEMENTS: '/inventory/movements',
      STOCK: '/inventory/stock'
    },
    FILES: {
      BASE: '/files',
      UPLOAD: '/files/upload',
      DOWNLOAD: '/files/download',
      DELETE: '/files/delete'
    }
  },
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

export const getAuthHeaders = (token: string) => ({
  ...API_CONFIG.HEADERS,
  'Authorization': `Bearer ${token}`
});

export const getFileUploadHeaders = (token: string) => ({
  'Authorization': `Bearer ${token}`
});

// Helper para construir URLs completas
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper para manejar errores de API
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'Error desconocido en la comunicación con el servidor';
}; 