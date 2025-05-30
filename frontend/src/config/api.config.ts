export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000/api',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout'
    },
    TRABAJADORES: {
      BASE: '/trabajadores',
      CREATE: '/',
      GET_ALL: '/all',
      SEARCH: '/detail/',
      UPDATE: (id: number) => `/${id}`,
      DELETE: (id: number) => `/${id}`
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