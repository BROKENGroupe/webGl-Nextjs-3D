// services/api/config.ts
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001',
  ENDPOINTS: {
    MATERIALS: '/materials/all',
    MATERIAL_BY_ID: (id: string) => `/materials/${id}`,
    MATERIAL_CATEGORIES: '/materials/categories',
    // MATERIAL_FREQUENCIES: '/api/v1/materials/frequencies'
    MATERIAL_FREQUENCIES: '/materials/frequencies'
  },
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  TIMEOUT: 10000, // 10 seconds
};

export const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  
  return {
    ...API_CONFIG.HEADERS,
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};