
'use client';

export const API_CONFIG = {
  BASE_URL: process.env.API_BASE_URL || 'http://127.0.0.1:3001/api',
  ENDPOINTS: {
    MATERIALS: '/materials',
    MATERIAL_BY_ID: (id: string) => `/materials/${id}`,
    MATERIAL_CATEGORIES: '/materials/categories',
    MATERIAL_FREQUENCIES: '/materials/frequencies'
  },
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  TIMEOUT: 10000, // 10 seconds
};

export const getAuthHeaders = () => {
  // Aquí puedes agregar lógica para obtener el token de autenticación
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  
  return {
    ...API_CONFIG.HEADERS,
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};