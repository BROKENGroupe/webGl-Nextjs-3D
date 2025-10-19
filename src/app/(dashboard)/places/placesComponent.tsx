"use client";

import { DetailsModal } from "@/modules/places/components/modals/DetailsModal";
import { OnboardingModal } from "@/modules/places/components/modals/OnboardingModal";
import { PlacesHeader } from "@/modules/places/components/PlacesHeader";
import { DistinctionsView } from "@/modules/places/components/views/DistinctionsView";
import { PlacesView } from "@/modules/places/components/views/EstablishmentsView";
import { StudiesView } from "@/modules/places/components/views/StudiesView";
import { usePlaces } from "@/modules/places/hooks/usePlaces";
import { Place } from "@/modules/places/types";
import { motion } from "framer-motion";

export default function PlacesPage() {
  const placesState = usePlaces();  

  const allSimulations = Array.isArray(placesState.places)
    ? placesState.places.flatMap((e: Place) => e.simulations || [])
    : [];

  const noPlaces = !placesState.places || placesState.places.length === 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full">
        {/* Header */}
        <PlacesHeader
          activeTab={
            placesState.activeTab === "places"
              ? "establishments"
              : placesState.activeTab
          }
          setActiveTab={(tab) =>
            placesState.setActiveTab(tab === "establishments" ? "places" : tab)
          }
          setShowOnboardingModal={placesState.setShowOnboardingModal}
          establishments={placesState.places}
          allStudies={allSimulations}
        />

        {/* Contenido */}
        <div className="bg-white px-8 py-6">
          {noPlaces ? (
            <div className="flex flex-col items-center justify-center py-24">
              <img
                src="/empty-places.svg"
                alt="Sin lugares"
                className="w-32 h-32 mb-6 opacity-80"
              />
              <h2 className="text-2xl font-bold text-gray-700 mb-2">
                ¡No tienes lugares registrados!
              </h2>
              <p className="text-gray-500 mb-6 text-center max-w-md">
                Comienza agregando tu primer lugar para ver aquí tus simulaciones, métricas y distinciones acústicas.
              </p>
              <button
                className="px-6 py-2 bg-black text-white rounded-lg font-semibold shadow transition-colors"
                onClick={() => placesState.setShowOnboardingModal(true)}
              >
                Crear Lugar
              </button>
            </div>
          ) : (
            <motion.div
              key={placesState.activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {placesState.activeTab === "places" ? (
                <PlacesView {...placesState} />
              ) : placesState.activeTab === "studies" ? (
                <StudiesView
                  places={placesState.places}
                  allStudies={allSimulations}
                />
              ) : (
                <DistinctionsView />
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Modales */}
      <DetailsModal
        isOpen={placesState.showDetailsModal}
        onClose={() => placesState.setShowDetailsModal(false)}
        place={placesState.selectedPlace}
      />
      <OnboardingModal
        isOpen={placesState.showOnboardingModal}
        onClose={() => placesState.setShowOnboardingModal(false)}
      />
    </div>
  );
}
