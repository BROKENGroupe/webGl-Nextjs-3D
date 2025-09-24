'use client';

// services/api/client.ts
import { API_CONFIG, getAuthHeaders } from '../config/config';

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_CONFIG.BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    console.log('Fetching API endpoint:', url);
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    };

    if (config.body instanceof FormData) {
      delete (config.headers as any)['Content-Type'];
    }

    // Agregar timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
    config.signal = controller.signal;

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
      
      throw new Error('Unknown error occurred');
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const searchParams = params ? `?${new URLSearchParams(params)}` : '';
    return this.request<T>(`${endpoint}${searchParams}`, {
      method: 'GET',
    });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const isFormData = data instanceof FormData;
    let body = data;
    if (!isFormData && data) {
        body = JSON.stringify(data);
    }
    return this.request<T>(endpoint, {
      method: 'POST',
      body,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const isFormData = data instanceof FormData;
    let body = data;
    if (!isFormData && data) {
        body = JSON.stringify(data);
    }
    return this.request<T>(endpoint, {
      method: 'PUT',
      body,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const isFormData = data instanceof FormData;
    let body = data;
    if (!isFormData && data) {
        body = JSON.stringify(data);
    }
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
