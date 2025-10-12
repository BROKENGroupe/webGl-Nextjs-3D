import { useState } from "react";
import { allStudies, establishments } from "../data/establishments";
import { Establishment } from "../types";

export const usePlaces = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'establishments' | 'studies' | 'distinctions'>('establishments');
  const [selectedStudyByEstablishment, setSelectedStudyByEstablishment] = useState<{[key: string]: number}>({});
  
  // Estados para modales y popovers
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEstablishment, setSelectedEstablishment] = useState<Establishment | null>(null);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [showPopover, setShowPopover] = useState<string | null>(null);
  const [hoveredProgress, setHoveredProgress] = useState<string | null>(null);

  const filteredEstablishments = establishments.filter((establishment) => {
    const matchesSearch = establishment.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         establishment.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || establishment.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || establishment.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getDisplayMetrics = (establishment: Establishment) => {
    const selectedIndex = selectedStudyByEstablishment[establishment.id] || 0;
    const activeStudy = establishment.studies[selectedIndex];
    
    if (activeStudy) {
      return {
        compliance_score: activeStudy.metrics.iso_compliance_level,
        sound_transmission_loss: activeStudy.metrics.sound_transmission_class,
        impact_sound_insulation: establishment.acousticProfile.impact_sound_insulation,
        noise_reduction: establishment.noise_impact_external
      };
    }
    
    return {
      compliance_score: establishment.compliance_score,
      sound_transmission_loss: establishment.acousticProfile.sound_transmission_loss,
      impact_sound_insulation: establishment.acousticProfile.impact_sound_insulation,
      noise_reduction: establishment.noise_impact_external
    };
  };

  const getActiveStudy = (establishment: Establishment) => {
    const selectedIndex = selectedStudyByEstablishment[establishment.id] || 0;
    return establishment.studies[selectedIndex];
  };

  const selectStudy = (establishmentId: string, studyIndex: number) => {
    setSelectedStudyByEstablishment(prev => ({
      ...prev,
      [establishmentId]: studyIndex
    }));
  };

  return {
    // Estados
    searchTerm,
    selectedType,
    selectedStatus,
    activeTab,
    selectedStudyByEstablishment,
    showDetailsModal,
    selectedEstablishment,
    showOnboardingModal,
    showPopover,
    hoveredProgress,
    
    // Setters
    setSearchTerm,
    setSelectedType,
    setSelectedStatus,
    setActiveTab,
    setShowDetailsModal,
    setSelectedEstablishment,
    setShowOnboardingModal,
    setShowPopover,
    setHoveredProgress,
    
    // Datos computados
    filteredEstablishments,
    establishments,
    allStudies,
    
    // Métodos
    getDisplayMetrics,
    getActiveStudy,
    selectStudy
  };
};