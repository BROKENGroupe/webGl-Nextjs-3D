// hooks/useMaterials.ts
import { useState, useEffect } from 'react';
import { MaterialCategory, ViewMode } from '../types/materials';
import { materialsService, MaterialResponse, GetMaterialsParams, CreateMaterialRequest } from '@/services/materialsService';

export const useMaterials = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MaterialCategory | 'ALL'>('ALL');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialResponse | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [materials, setMaterials] = useState<MaterialResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaterials = async () => {
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
        console.log('Materials fetched:', response.data);
        if (response.data) {
          console.log('Materials True');
          setMaterials(response.data);
        } else {
          throw new Error(response.message || 'Failed to fetch materials');
        }
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce fetching to avoid excessive API calls
    const handler = setTimeout(() => {
      fetchMaterials();
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, selectedCategory]);

  const addMaterial = async (newMaterialData: CreateMaterialRequest) => {
    try {
      const response = await materialsService.createMaterial(newMaterialData);
      if (response.data) {
        // Add the new material to the state to avoid a full re-fetch
        setMaterials(prev => [response.data, ...prev]);
        closeCreateModal();
      } else {
        throw new Error(response.message || 'Failed to create material');
      }
    } catch (err: any) {
      console.error('Creation Error:', err);
      setError(err.message);
      // Optionally re-throw or handle the error in the UI
      throw err;
    }
  };

  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => setIsCreateModalOpen(false);

  return {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    viewMode,
    setViewMode,
    selectedMaterial,
    setSelectedMaterial,
    materials, // This now contains the filtered materials from the backend
    isLoading,
    error,
    isCreateModalOpen,
    openCreateModal,
    closeCreateModal,
    addMaterial
  };
};
