import React, { memo } from 'react';
import { Plus } from 'lucide-react';
import { Establishment } from '@/types/dashboard';

interface EstablishmentsSectionProps {
  establishments: Establishment[];
  onCreateEstablishment: () => void;
}

export const EstablishmentsSection = memo(function EstablishmentsSection({ 
  establishments, 
  onCreateEstablishment,
}: EstablishmentsSectionProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-semibold text-neutral-900">Mis Establecimientos</h2>
        
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {establishments.map(establishment => (
          <EstablishmentCard key={establishment.id} establishment={establishment} />
        ))}
        
        {/* Card para crear nuevo - estilo botón de login */}
        <button 
          onClick={onCreateEstablishment}
          className="group relative flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 text-white rounded-2xl p-6 min-h-[110px] transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-2xl hover:shadow-slate-900/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
        >
          {/* Gradiente de hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out" />
          
          {/* Brillo sutil */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out" />
          
          {/* Contenido */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm mb-3 group-hover:bg-white/20 transition-colors duration-300">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-100 group-hover:text-white transition-colors duration-300">
              
            </span>
          </div>
          
        </button>
      </div>
    </section>
  );
});

// Componente individual de establecimiento
const EstablishmentCard = memo(function EstablishmentCard({ 
  establishment 
}: { 
  establishment: Establishment 
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-4 border border-neutral-200 hover:border-black transition min-h-[110px]">
      <div className="w-3 h-3 rounded-full bg-emerald-400" />
      <div>
        <div className="font-semibold text-lg text-neutral-900">{establishment.name}</div>
        {establishment.type && (
          <div className="text-sm text-neutral-500 capitalize">{establishment.type}</div>
        )}
      </div>
    </div>
  );
});

EstablishmentsSection.displayName = 'EstablishmentsSection';
EstablishmentCard.displayName = 'EstablishmentCard';