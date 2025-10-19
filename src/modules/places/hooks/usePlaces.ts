import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPlacesWorkspaceAction } from "@/actions/place/place.actions";
import { Place } from "../types";

export const usePlaces = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"places" | "studies" | "distinctions">("places");
  const [selectedSimulationByPlace, setSelectedSimulationByPlace] = useState<{[key: string]: number}>({});
  
  // Estados para modales y popovers
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [showPopover, setShowPopover] = useState<string | null>(null);
  const [hoveredProgress, setHoveredProgress] = useState<string | null>(null);

  // Obtener places desde el backend
  const { data: placesRaw, isFetched } = useQuery({
    queryKey: ["places"],
    queryFn: getPlacesWorkspaceAction,
  });

  // Controlar que places sea siempre un array
  const places: Place[] = Array.isArray(placesRaw) ? placesRaw : [];

  // allSimulations calculado desde los places traídos
  const allSimulations = places.flatMap((e: Place) => e.simulations || []);

  const filteredPlaces = places.filter((place: Place) => {
    const matchesSearch = place.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         place.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || place.category.name === selectedType;
    const matchesStatus = selectedStatus === 'all' || place.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getDisplayMetrics = (place: Place) => {
    const selectedIndex = selectedSimulationByPlace[place.id] || 0;
    const activeSimulation = place.simulations?.[selectedIndex];
    
    if (activeSimulation) {
      return {
        complianceScore: activeSimulation.metrics.isoComplianceLevel,
        soundTransmissionLoss: activeSimulation.metrics.soundTransmissionClass,
        impactSoundInsulation: activeSimulation.acousticProfile.impactSoundInsulation,
        noiseReduction: place.noiseImpactExternal
      };
    }
    
    return {
      complianceScore: place.complianceScore,
      soundTransmissionLoss: place.acousticProfile.soundTransmissionLoss,
      impactSoundInsulation: place.acousticProfile.impactSoundInsulation,
      noiseReduction: place.noiseImpactExternal
    };
  };

  const getActiveSimulation = (place: Place) => {
    const selectedIndex = selectedSimulationByPlace[place.id] || 0;
    return place.simulations?.[selectedIndex];
  };

  const selectSimulation = (placeId: string, simulationIndex: number) => {
    setSelectedSimulationByPlace(prev => ({
      ...prev,
      [placeId]: simulationIndex
    }));
  };

  return {
    // Estados
    searchTerm,
    selectedType,
    selectedStatus,
    activeTab,
    selectedSimulationByPlace,
    showDetailsModal,
    selectedPlace,
    showOnboardingModal,
    showPopover,
    hoveredProgress,
    isFetched,
    
    // Setters
    setSearchTerm,
    setSelectedType,
    setSelectedStatus,
    setActiveTab,
    setShowDetailsModal,
    setSelectedPlace,
    setShowOnboardingModal,
    setShowPopover,
    setHoveredProgress,
    
    // Datos computados
    filteredPlaces,
    places,
    allSimulations,
    
    // Métodos
    getDisplayMetrics,
    getActiveSimulation,
    selectSimulation
  };
};