import { useState, useMemo } from 'react';
import { Study, Establishment, DashboardStats } from '@/types/dashboard';

// ✅ Datos mock - eventualmente vendrán de API
const MOCK_STUDIES: Study[] = [
  { id: 1, name: "Estudio Acústico Oficina", status: "ok" },
  { id: 2, name: "Estudio Restaurante", status: "review" },
];

const MOCK_ESTABLISHMENTS: Establishment[] = [
  { id: 1, name: "Oficina Central", type: "office" },
  { id: 2, name: "Restaurante Sur", type: "restaurant" },
];

export function useDashboard() {
  const [studies, setStudies] = useState<Study[]>(MOCK_STUDIES);
  const [establishments, setEstablishments] = useState<Establishment[]>(MOCK_ESTABLISHMENTS);
  const [loading, setLoading] = useState(false);

  // ✅ Calcular estadísticas
  const stats = useMemo((): DashboardStats => {
    const studiesOk = studies.filter(s => s.status === "ok").length;
    const studiesReview = studies.filter(s => s.status === "review").length;
    const totalStudies = studies.length;
    const totalEstablishments = establishments.length;

    return {
      studiesOk,
      studiesReview,
      totalStudies,
      totalEstablishments
    };
  }, [studies, establishments]);

  // ✅ Funciones para manejar estudios
  const createStudy = async (studyData: Omit<Study, 'id'>) => {
    setLoading(true);
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newStudy: Study = {
        ...studyData,
        id: Date.now() // ID temporal
      };
      
      setStudies(prev => [...prev, newStudy]);
      return newStudy;
    } catch (error) {
      console.error('Error creating study:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateStudy = async (id: number, updates: Partial<Study>) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setStudies(prev => 
        prev.map(study => 
          study.id === id ? { ...study, ...updates } : study
        )
      );
    } catch (error) {
      console.error('Error updating study:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteStudy = async (id: number) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setStudies(prev => prev.filter(study => study.id !== id));
    } catch (error) {
      console.error('Error deleting study:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Funciones para manejar establecimientos
  const createEstablishment = async (establishmentData: Omit<Establishment, 'id'>) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newEstablishment: Establishment = {
        ...establishmentData,
        id: Date.now()
      };
      
      setEstablishments(prev => [...prev, newEstablishment]);
      return newEstablishment;
    } catch (error) {
      console.error('Error creating establishment:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateEstablishment = async (id: number, updates: Partial<Establishment>) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setEstablishments(prev => 
        prev.map(est => 
          est.id === id ? { ...est, ...updates } : est
        )
      );
    } catch (error) {
      console.error('Error updating establishment:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteEstablishment = async (id: number) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setEstablishments(prev => prev.filter(est => est.id !== id));
    } catch (error) {
      console.error('Error deleting establishment:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    // Data
    studies,
    establishments,
    stats,
    loading,
    
    // Actions
    createStudy,
    updateStudy,
    deleteStudy,
    createEstablishment,
    updateEstablishment,
    deleteEstablishment
  };
}