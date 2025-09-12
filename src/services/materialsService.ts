// services/materialsService.ts
import { Material, MaterialCategory, ThirdOctave } from '@/modules/materials/types/materials';
import { apiClient, ApiResponse } from '../core/api/client';
import { API_CONFIG } from '../core/config/config';

export interface CreateMaterialRequest {
  name: string;
  description: string;
  category: MaterialCategory;
  density: number;
  reference: string;
  is_active: boolean;
  picture: string | null;
  rw: number;
  descriptor: string;
  subtype: string;
  type: string;
  comments?: string;
  thickness_mm: number;
  mass_kg_m2: number;
  catalog: string;
  color?: string;
  doubleLeaf?: boolean;
  lightweightElement?: boolean;
  onElasticBands?: boolean;
  layers: { name: string; thickness_mm: number }[];
  thirdOctaveBands: Record<ThirdOctave, number>;
  octaveBands: { range: string; value: string }[];
  weightedIndex?: { Rw: number; C: number; Ctr: number };
  imageRef?: string;
  width: number;
  height: number;
  bottomOffset: number;
}

export interface UpdateMaterialRequest extends Partial<CreateMaterialRequest> {
  id?: string;
}

export type MaterialResponse = Material & {
  _id: string;
  created_at: string;
  updated_at: string;
};

export interface GetMaterialsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: MaterialCategory;
  is_active?: boolean;
  sort_by?: 'name' | 'created_at' | 'updated_at' | 'rw' | 'density';
  sort_order?: 'asc' | 'desc';
}

class MaterialsService {
  /**
   * Obtener todos los materiales con filtros opcionales
   */
  async getMaterials(params?: GetMaterialsParams): Promise<ApiResponse<MaterialResponse[]>> {
    try {
      return await apiClient.get<MaterialResponse[]>(
        API_CONFIG.ENDPOINTS.MATERIALS + '/all',
        params
      );
    } catch (error) {
      console.error('Error fetching materials:', error);
      throw error;
    }
  }

  /**
   * Obtener un material por ID
   */
  async getMaterialById(id: string): Promise<ApiResponse<MaterialResponse>> {
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
  async getMaterialByReference(reference: string): Promise<ApiResponse<MaterialResponse>> {
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
  async createMaterial(data: CreateMaterialRequest): Promise<ApiResponse<MaterialResponse>> {
    try {
      console.log('Creating material with data:', data);
      // Validar datos antes de enviar
      this.validateMaterialData(data);

      return await apiClient.post<MaterialResponse>(
        API_CONFIG.ENDPOINTS.MATERIALS,
        data
      );
    } catch (error) {
      console.error('Error creating material:', error);
      throw error;
    }
  }

  /**
   * Actualizar un material existente
   */
  async updateMaterial(id: string, data: UpdateMaterialRequest): Promise<ApiResponse<MaterialResponse>> {
    try {
      if (data.reference || data.thirdOctaveBands) {
        this.validateMaterialData(data as CreateMaterialRequest);
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
  async patchMaterial(id: string, data: Partial<UpdateMaterialRequest>): Promise<ApiResponse<MaterialResponse>> {
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
  async deleteMaterial(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
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
  async toggleMaterialStatus(id: string, is_active: boolean): Promise<ApiResponse<MaterialResponse>> {
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
  async getCategories(): Promise<ApiResponse<{ value: MaterialCategory; label: string }[]>> {
    try {
      return await apiClient.get<{ value: MaterialCategory; label: string }[]>(
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
  async getStandardFrequencies(): Promise<ApiResponse<number[]>> {
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
  async searchMaterials(query: string, limit: number = 10): Promise<ApiResponse<MaterialResponse[]>> {
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
  private validateMaterialData(data: Partial<CreateMaterialRequest>): void {
    const errors: string[] = [];

    if (!data.name?.trim()) errors.push('Material name is required');
    if (!data.reference?.trim()) errors.push('Material reference is required');
    if (!data.description?.trim()) errors.push('Material description is required');
    if ((data.density ?? 0) <= 0) errors.push('Density must be a positive number');
    if ((data.rw ?? 0) <= 0) errors.push('Rw value must be a positive number');
    if ((data.thickness_mm ?? 0) <= 0) errors.push('Thickness must be a positive number');
    if ((data.mass_kg_m2 ?? 0) <= 0) errors.push('Mass must be a positive number');
    if (!data.category) errors.push('Category is required');
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