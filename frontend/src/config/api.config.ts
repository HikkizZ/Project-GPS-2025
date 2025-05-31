export const API_CONFIG = {
  BASE_URL: '/api',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout'
    },
    TRABAJADORES: {
      BASE: '/trabajadores',
      ALL: '/trabajadores/all',
      DETAIL: '/trabajadores/detail'
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