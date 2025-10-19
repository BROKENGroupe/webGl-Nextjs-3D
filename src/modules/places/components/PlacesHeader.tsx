// File path: f:\BROKENCREATIVES\DEVELOPER\insonor\webGl-Nextjs-3D\src\app\(dashboard)\places\PlacesHeader.tsx
import React from "react";
import { LinearProgress } from "./progress/LinearProgress";
import { availableBadges } from "../data/establishments";

interface PlacesHeaderProps {
  activeTab: "establishments" | "studies" | "distinctions";
  setActiveTab: (tab: "establishments" | "studies" | "distinctions") => void;
  setShowOnboardingModal: (show: boolean) => void;
  establishments: any[];
  allStudies: any[];
}

export const PlacesHeader: React.FC<PlacesHeaderProps> = ({
  activeTab,
  setActiveTab,
  setShowOnboardingModal,
  establishments,
  allStudies,
}) => {
  const avgCompliance = Math.round(
    establishments.reduce((sum, e) => sum + e.compliance_score, 0) /
      establishments.length
  );
  const avgSTC = Math.round(
    establishments.reduce(
      (sum, e) => sum + e.acousticProfile.sound_transmission_loss,
      0
    ) / establishments.length
  );
  const avgExternal = Math.round(
    establishments.reduce((sum, e) => sum + e.noise_impact_external, 0) /
      establishments.length
  );
  const completedStudies = allStudies.filter(
    (s) => s.status === "completed"
  ).length;

  return (
    <>
      {/* Header principal */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">
            Establecimentos y mediciones
          </h1>
          <button
            onClick={() => setShowOnboardingModal(true)}
            className="inline-flex items-center px-4 py-2 bg-black hover:bg-gray-900 text-white text-sm font-medium rounded-md shadow-sm transition-colors"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Nuevo{" "}
            {activeTab === "establishments"
              ? "Establecimiento"
              : activeTab === "studies"
              ? "Estudio ISO"
              : "Distinción"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-8">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("establishments")}
            className={`py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "establishments"
                ? "border-black text-black"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            Establecimientos ({establishments.length})
          </button>
          <button
            onClick={() => setActiveTab("studies")}
            className={`py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "studies"
                ? "border-black text-black"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            Estudios Acústicos ({allStudies.length})
          </button>
          <button
            onClick={() => setActiveTab("distinctions")}
            className={`py-4 text-sm font-medium border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === "distinctions"
                ? "border-black text-black"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <span>
              Distinciones ({availableBadges.filter((b) => b.earned).length})
            </span>
          </button>
        </nav>
      </div>

      {/* Estadísticas acústicas - estilo minimalista */}
      {/* <div className="bg-white border-b border-gray-100 px-8 py-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         
          <div className="text-center p-4 border rounded-lg shadow-sm bg-white">
            <div className="text-2xl font-semibold text-black mb-1">
              {avgCompliance}%
            </div>
            <div className="text-xs text-gray-500 mb-2">ISO Promedio</div>
            <LinearProgress
              percentage={avgCompliance}
              color="black"
              height="h-1.5"
            />
          </div>
        
          <div className="text-center p-4 border rounded-lg shadow-sm bg-white">
            <div className="text-2xl font-semibold text-black mb-1">
              {avgSTC} dB
            </div>
            <div className="text-xs text-gray-500 mb-2">STC Promedio</div>
            <LinearProgress
              percentage={Math.min((avgSTC / 60) * 100, 100)}
              color="black"
              height="h-1.5"
            />
          </div>
          
          <div className="text-center p-4 border rounded-lg shadow-sm bg-white">
            <div className="text-2xl font-semibold text-black mb-1">
              {avgExternal} dB
            </div>
            <div className="text-xs text-gray-500 mb-2">Red. Externa</div>
            <LinearProgress
              percentage={Math.min((avgExternal / 40) * 100, 100)}
              color="gray"
              height="h-1.5"
            />
          </div>
        
          <div className="text-center p-4 border rounded-lg shadow-sm bg-white">
            <div className="text-2xl font-semibold text-black mb-1">
              {completedStudies}
            </div>
            <div className="text-xs text-gray-500 mb-2">Completados</div>
            <LinearProgress
              percentage={(completedStudies / allStudies.length) * 100}
              color="black"
              height="h-1.5"
            />
          </div>
        </div>
      </div> */}
    </>
  );
};
