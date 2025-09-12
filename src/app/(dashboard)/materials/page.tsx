'use client';

import React from 'react';
// Components
import { PageHeader } from '../../../modules/materials/components/PageHeader';
import { MaterialsFilters } from '../../../modules/materials/components/MaterialsFilters';
import { MaterialCard } from '../../../modules/materials/components/MaterialCard';
import { MaterialsTable } from '../../../modules/materials/components/MaterialsTable';
import { MaterialDetailModal } from '../../../modules/materials/components/MaterialDetailModal';
import { CreateMaterialModal } from '../../../modules/materials/components/CreateMaterialModal';
import { EditMaterialModal } from '../../../modules/materials/components/EditMaterialModal';
import { DeleteConfirmationModal } from '../../../modules/materials/components/DeleteConfirmationModal';
import { EmptyState } from '../../../modules/materials/components/EmptyState';
import { Skeleton } from '@/shared/ui/skeleton';

// Hooks
import { useMaterials } from '../../../modules/materials/hooks/useMaterials';

const MaterialsViewer = () => {
  const {
    // State
    materials,
    viewMode,
    isLoading,
    isSubmitting,
    error,
    searchTerm,
    selectedCategory,
    selectedMaterial, // For details
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
  } = useMaterials();

  // Separate state for create modal to not conflict with edit/delete flows
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  const renderContent = () => {
    if (isLoading) {
      return viewMode === 'cards' ? (
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
      );
    }

    if (error) {
      return <div className="text-red-500 text-center py-10">Error: {error}</div>;
    }

    if (materials.length === 0) {
      return <EmptyState onCreateNew={() => setIsCreateModalOpen(true)} />;
    }

    return viewMode === 'cards' ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materials.map((material) => (
          <MaterialCard 
            key={material._id} 
            material={material}
            onViewDetails={setSelectedMaterial}
            onEdit={handleOpenEditModal}
            onDelete={handleOpenDeleteModal}
          />
        ))}
      </div>
    ) : (
      <MaterialsTable 
        materials={materials}
        onViewDetails={setSelectedMaterial}
        onEdit={handleOpenEditModal}
        onDelete={handleOpenDeleteModal}
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
            onCreateMaterial={() => setIsCreateModalOpen(true)}
          />

          <div className="mb-6">
            <p className="text-gray-600">
              {!isLoading && !error && `Mostrando ${materials.length} material${materials.length !== 1 ? 'es' : ''}`}
            </p>
          </div>

          {renderContent()}

          {/* Modals */}
          <MaterialDetailModal 
            material={selectedMaterial}
            onClose={() => setSelectedMaterial(null)}
          />

          <CreateMaterialModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSave={async (data) => {
              await createMaterial(data);
              setIsCreateModalOpen(false);
            }}
          />

          <EditMaterialModal
            isOpen={!!materialToEdit}
            onClose={handleCloseEditModal}
            material={materialToEdit}
            onSave={updateMaterial}
          />

          <DeleteConfirmationModal
            isOpen={!!materialToDelete}
            onClose={handleCloseDeleteModal}
            onConfirm={deleteMaterial}
            materialName={materialToDelete?.name || ''}
            isLoading={isSubmitting}
          />
        </div>
      </div>
    </>
  );
};

export default MaterialsViewer;