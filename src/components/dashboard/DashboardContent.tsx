'use client';
import React from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { DashboardStatsComponent } from '@/components/dashboard/DashboardStats';
import { StudiesSection } from '@/components/dashboard/StudiesSection';
import { EstablishmentsSection } from '@/components/dashboard/EstablishmentsSection';
import { toast } from 'sonner';

export default function DashboardContent() {
  const {
    studies,
    establishments,
    stats,
    loading,
    createStudy,
    createEstablishment
  } = useDashboard();

  //   Handlers para crear elementos
  const handleCreateStudy = async () => {
    try {
      await createStudy({
        name: `Estudio ${studies.length + 1}`,
        status: 'pending'
      });
      toast.success('Estudio creado exitosamente');
    } catch (error) {
      toast.error('Error al crear el estudio');
    }
  };

  const handleCreateEstablishment = async () => {
    try {
      await createEstablishment({
        name: `Establecimiento ${establishments.length + 1}`,
        type: 'office',
        estudies: []
      });
      toast.success('Establecimiento creado exitosamente');
    } catch (error) {
      toast.error('Error al crear el establecimiento');
    }
  };

  return (
    <main className="p-10 max-w-7xl">
      {/* Indicadores */}
      <DashboardStatsComponent stats={stats} />

      {/* Sección de Estudios */}
      <StudiesSection 
        studies={studies}
        onCreateStudy={handleCreateStudy}
        loading={loading}
      />

      {/* Sección de Establecimientos */}
      <EstablishmentsSection 
        establishments={establishments}
        onCreateEstablishment={handleCreateEstablishment}
      />
    </main>
  );
}