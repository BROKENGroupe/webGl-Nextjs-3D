// hooks/useMaterials.ts
import { useState, useEffect, useCallback } from 'react';
import { MaterialCategory, ViewMode } from '../types/materials';
import { 
  materialsService, 
  MaterialResponse, 
  GetMaterialsParams, 
  CreateMaterialRequest, 
  UpdateMaterialRequest 
} from '@/services/materialsService';

export const useMaterials = () => {
  // Main data and view state
  const [materials, setMaterials] = useState<MaterialResponse[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MaterialCategory | 'ALL'>('ALL');

  // Modal and selected material state
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialResponse | null>(null); // For details view
  const [materialToEdit, setMaterialToEdit] = useState<MaterialResponse | null>(null);
  const [materialToDelete, setMaterialToDelete] = useState<MaterialResponse | null>(null);

  // Fetch materials from backend
  const fetchMaterials = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: GetMaterialsParams = {
        search: searchTerm,
        category: selectedCategory === 'ALL' ? undefined : selectedCategory,
        sort_by: 'name',
        sort_order: 'asc',
      };
      const response = await materialsService.getMaterials(params);
      if (response.data) {
        setMaterials(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch materials');
      }
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchMaterials();
    }, 300); // Debounce search
    return () => clearTimeout(handler);
  }, [fetchMaterials]);

  // --- CRUD Handlers ---

  const createMaterial = async (newMaterialData: CreateMaterialRequest) => {
    setIsSubmitting(true);
    try {
      const response = await materialsService.createMaterial(newMaterialData);
      if (response.data) {
        setMaterials(prev => [response.data, ...prev]);
        setSelectedMaterial(null); // Close create modal is handled by parent
      } else {
        throw new Error(response.message || 'Failed to create material');
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateMaterial = async (id: string, data: UpdateMaterialRequest) => {
    setIsSubmitting(true);
    try {
      const response = await materialsService.updateMaterial(id, data);
      if (response.data) {
        setMaterials(prev => prev.map(m => m._id === id ? response.data : m));
        setMaterialToEdit(null); // Close edit modal
      } else {
        throw new Error(response.message || 'Failed to update material');
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteMaterial = async () => {
    if (!materialToDelete) return;
    setIsSubmitting(true);
    try {
      const response = await materialsService.deleteMaterial(materialToDelete._id);
      if (response.data) {
        setMaterials(prev => prev.filter(m => m._id !== materialToDelete._id));
        setMaterialToDelete(null); // Close delete modal
      } else {
        throw new Error(response.message || 'Failed to delete material');
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Modal Control ---

  const handleOpenEditModal = (material: MaterialResponse) => setMaterialToEdit(material);
  const handleCloseEditModal = () => setMaterialToEdit(null);

  const handleOpenDeleteModal = (material: MaterialResponse) => setMaterialToDelete(material);
  const handleCloseDeleteModal = () => setMaterialToDelete(null);

  return {
    // State
    materials,
    viewMode,
    isLoading,
    isSubmitting,
    error,
    searchTerm,
    selectedCategory,
    selectedMaterial,
    materialToEdit,
    materialToDelete,
    
    // State Setters
    setViewMode,
    setSearchTerm,
    setSelectedCategory,
    setSelectedMaterial,

    // CRUD Actions
    createMaterial,
    updateMaterial,
    deleteMaterial,

    // Modal Handlers
    handleOpenEditModal,
    handleCloseEditModal,
    handleOpenDeleteModal,
    handleCloseDeleteModal,
  };
};