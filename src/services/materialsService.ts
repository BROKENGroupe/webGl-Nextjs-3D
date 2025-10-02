// services/materialsService.ts
import { Material, MaterialType, CreateMaterial } from '@/modules/materials/types/materials';
import { AcousticMaterial } from '@/modules/materials/types/AcousticMaterial';
import { apiClient, ApiResponse } from '../core/api/client';
import { API_CONFIG } from '../core/config/config';



export interface UpdateMaterialRequest extends Partial<AcousticMaterial> {
  id?: string;
}

export type MaterialResponse = AcousticMaterial & {
  _id: string;
  created_at: string;
  updated_at: string;
};



export interface GetMaterialsParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: MaterialType;
  is_active?: boolean;
  sort_by?: 'name' | 'created_at' | 'updated_at' | 'rw' | 'density';
  sort_order?: 'asc' | 'desc';
}

class MaterialsService {
  /**
   * Obtener todos los materiales con filtros opcionales
   */
  async getMaterials(params?: GetMaterialsParams): Promise<AcousticMaterial[]> {
    try {

      const response = await apiClient.get<AcousticMaterial[]>(
        API_CONFIG.ENDPOINTS.MATERIALS + '/all',
        // params
      );

      console.log('Materials fetched from API:', response);
      return response;
      
    
    } catch (error) {
      console.error('Error fetching materials:', error);
      throw error;
    }
  }

  /**
   * Obtener un material por ID
   */
  async getMaterialById(id: string): Promise<MaterialResponse> {
    try {
      return await apiClient.get<MaterialResponse>(
        API_CONFIG.ENDPOINTS.MATERIAL_BY_ID(id)
      );
    } catch (error) {
      console.error(`Error fetching material ${id}:`, error);
      throw error;
    }
  }

  /**
   * Obtener un material por referencia única
   */
  async getMaterialByReference(reference: string): Promise<MaterialResponse> {
    try {
      return await apiClient.get<MaterialResponse>(
        `${API_CONFIG.ENDPOINTS.MATERIALS}/reference/${reference}`
      );
    } catch (error) {
      console.error(`Error fetching material with reference ${reference}:`, error);
      throw error;
    }
  }

  /**
   * Crear un nuevo material
   */
  async createMaterial(data: CreateMaterial): Promise<MaterialResponse> {
    try {
      console.log('Creating material with data:', data);

      const { picture, ...validationData } = data;
      this.validateMaterialData(validationData);

      let payload: CreateMaterial | FormData = data;

      if (picture && typeof picture !== 'string') {
        const formData = new FormData();
        formData.append('picture', picture as File);

        const { picture: p, ...restData } = data;

        Object.entries(restData).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
                    formData.append(key, JSON.stringify(value));
                } else {
                    formData.append(key, String(value));
                }
            }
        });
        payload = formData;
      }

      return await apiClient.post<MaterialResponse>(
        API_CONFIG.ENDPOINTS.MATERIALS,
        payload
      );
    } catch (error) {
      console.error('Error creating material:', error);
      throw error;
    }
  }

  /**
   * Actualizar un material existente
   */
  async updateMaterial(id: string, data: UpdateMaterialRequest): Promise<MaterialResponse> {
    try {
      if (data.reference || data.thirdOctaveBands) {
        this.validateMaterialData(data as AcousticMaterial);
      }

      return await apiClient.put<MaterialResponse>(
        API_CONFIG.ENDPOINTS.MATERIAL_BY_ID(id),
        data
      );
    } catch (error) {
      console.error(`Error updating material ${id}:`, error);
      throw error;
    }
  }

  /**
   * Actualización parcial de un material
   */
  async patchMaterial(id: string, data: Partial<UpdateMaterialRequest>): Promise<MaterialResponse> {
    try {
      return await apiClient.patch<MaterialResponse>(
        API_CONFIG.ENDPOINTS.MATERIAL_BY_ID(id),
        data
      );
    } catch (error) {
      console.error(`Error patching material ${id}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar un material
   */
  async deleteMaterial(id: string): Promise<{ deleted: boolean }> {
    try {
      return await apiClient.delete<{ deleted: boolean }>(
        API_CONFIG.ENDPOINTS.MATERIAL_BY_ID(id)
      );
    } catch (error) {
      console.error(`Error deleting material ${id}:`, error);
      throw error;
    }
  }

  /**
   * Activar/desactivar un material
   */
  async toggleMaterialStatus(id: string, is_active: boolean): Promise<MaterialResponse> {
    try {
      return await apiClient.patch<MaterialResponse>(
        API_CONFIG.ENDPOINTS.MATERIAL_BY_ID(id),
        { is_active }
      );
    } catch (error) {
      console.error(`Error toggling material ${id} status:`, error);
      throw error;
    }
  }

  /**
   * Obtener categorías disponibles
   */
  async getCategories(): Promise<{ value: AcousticMaterial; label: string }[]> {
    try {
      return await apiClient.get<{ value: AcousticMaterial; label: string }[]>(
        API_CONFIG.ENDPOINTS.MATERIAL_CATEGORIES
      );
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  /**
   * Obtener frecuencias estándar
   */
  async getStandardFrequencies(): Promise<number[]> {
    try {
      return await apiClient.get<number[]>(
        API_CONFIG.ENDPOINTS.MATERIAL_FREQUENCIES
      );
    } catch (error) {
      console.error('Error fetching frequencies:', error);
      throw error;
    }
  }

  /**
   * Buscar materiales por texto
   */
  async searchMaterials(query: string, limit: number = 10): Promise<MaterialResponse[]> {
    try {
      return await apiClient.get<MaterialResponse[]>(
        `${API_CONFIG.ENDPOINTS.MATERIALS}/search`,
        { q: query, limit }
      );
    } catch (error) {
      console.error('Error searching materials:', error);
      throw error;
    }
  }

  /**
   * Validar datos del material
   */
  private validateMaterialData(data: Partial<AcousticMaterial>): void {
    const errors: string[] = [];

    if (!data.name?.trim()) errors.push('Material name is required');
    if (!data.reference?.trim()) errors.push('Material reference is required');
    if (!data.description?.trim()) errors.push('Material description is required');
    if ((data.density ?? 0) <= 0) errors.push('Density must be a positive number');
    if ((data.thickness ?? 0) <= 0) errors.push('Thickness must be a positive number');
    if ((data.mass ?? 0) <= 0) errors.push('Mass must be a positive number');
    if (!data.type?.trim()) errors.push('Type is required');
    if (!data.subtype?.trim()) errors.push('Subtype is required');
    if (!data.descriptor?.trim()) errors.push('Descriptor is required');
    if (!data.catalog?.trim()) errors.push('Catalog is required');
    if (!data.thirdOctaveBands || Object.keys(data.thirdOctaveBands).length === 0) {
      errors.push('Third octave bands are required');
    }

    if (errors.length > 0) {
      throw new Error(`Validation errors: ${errors.join(', ')}`);
    }
  }
}

export const materialsService = new MaterialsService();
