'use client';

import React from 'react';
// Components
import { PageHeader } from './components/PageHeader';
import { MaterialsFilters } from './components/MaterialsFilters';
import { MaterialCard } from './components/MaterialCard';
import { MaterialsTable } from './components/MaterialsTable';
import { MaterialDetailModal } from './components/MaterialDetailModal';
import { CreateMaterialModal } from './components/CreateMaterialModal';
import { EmptyState } from './components/EmptyState';
import { Skeleton } from '@/shared/ui/skeleton'; // Assuming this is the correct path

// Hooks
import { useMaterials } from './hooks/useMaterials';
import { CreateMaterialRequest } from '@/services/materialsService';

const MaterialsViewer = () => {
  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    viewMode,
    setViewMode,
    selectedMaterial,
    setSelectedMaterial,
    materials,
    isLoading,
    error,
    isCreateModalOpen,
    openCreateModal,
    closeCreateModal,
    addMaterial
  } = useMaterials();

  const handleCloseModal = () => {
    setSelectedMaterial(null);
  };

  const handleSaveMaterial = async (materialData: CreateMaterialRequest) => {
    try {
      await addMaterial(materialData);
      // The modal will be closed on success from the hook
    } catch (err) {
      // The hook already sets the error state, but you might want to show a notification here
      console.error("Failed to save material from page");
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-48 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        )
      );
    }

    if (error) {
      return <div className="text-red-500 text-center py-10">Error: {error}</div>;
    }

    if (materials.length === 0) {
      return <EmptyState />;
    }

    return viewMode === 'cards' ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materials.map((material) => (
          <MaterialCard 
            key={material._id} 
            material={material}
            onViewDetails={() => setSelectedMaterial(material)}
          />
        ))}
      </div>
    ) : (
      <MaterialsTable 
        materials={materials}
        onViewDetails={setSelectedMaterial}
      />
    );
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PageHeader />

          <MaterialsFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onCreateMaterial={openCreateModal}
          />

          <div className="mb-6">
            <p className="text-gray-600">
              {!isLoading && !error && `Mostrando ${materials.length} material${materials.length !== 1 ? 'es' : ''}`}
            </p>
          </div>

          {renderContent()}

          <MaterialDetailModal 
            material={selectedMaterial}
            onClose={handleCloseModal}
          />

          <CreateMaterialModal
            isOpen={isCreateModalOpen}
            onClose={closeCreateModal}
            onSave={handleSaveMaterial}
          />
        </div>
      </div>
    </>
  );
};

export default MaterialsViewer;
