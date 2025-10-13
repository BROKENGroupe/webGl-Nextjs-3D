"use client";


import { DetailsModal } from "@/modules/places/components/modals/DetailsModal";
import { OnboardingModal } from "@/modules/places/components/modals/OnboardingModal";
import { PlacesHeader } from "@/modules/places/components/PlacesHeader";
import { DistinctionsView } from "@/modules/places/components/views/DistinctionsView";
import { EstablishmentsView } from "@/modules/places/components/views/EstablishmentsView";
import { StudiesView } from "@/modules/places/components/views/StudiesView";

import { usePlaces } from "@/modules/places/hooks/usePlaces";
import { motion } from "framer-motion";

export default function PlacesPage() {
  const placesState = usePlaces();

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full">
        {/* Header */}
        <PlacesHeader 
          activeTab={placesState.activeTab}
          setActiveTab={placesState.setActiveTab}
          setShowOnboardingModal={placesState.setShowOnboardingModal}
          establishments={placesState.establishments}
          allStudies={placesState.allStudies}
        />

        {/* Contenido */}
        <div className="bg-white px-8 py-6">
          <motion.div
            key={placesState.activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {placesState.activeTab === 'establishments' ? (
              <EstablishmentsView {...placesState} />
            ) : placesState.activeTab === 'studies' ? (
              <StudiesView {...placesState} />
            ) : (
              <DistinctionsView />
            )}
          </motion.div>
        </div>
      </div>

      {/* Modales */}
      <DetailsModal 
        isOpen={placesState.showDetailsModal}
        onClose={() => placesState.setShowDetailsModal(false)}
        establishment={placesState.selectedEstablishment}
      />
      <OnboardingModal 
        isOpen={placesState.showOnboardingModal}
        onClose={() => placesState.setShowOnboardingModal(false)}
      />
    </div>
  );
}
