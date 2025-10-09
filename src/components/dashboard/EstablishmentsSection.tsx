import React, { memo } from 'react';
import { Establishment } from '@/types/dashboard';

interface EstablishmentsSectionProps {
  establishments: Establishment[];
  onCreateEstablishment: () => void;
  loading?: boolean;
}

export const EstablishmentsSection = memo(function EstablishmentsSection({ 
  establishments, 
  onCreateEstablishment,
  loading = false 
}: EstablishmentsSectionProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-semibold text-neutral-900">Mis Establecimientos</h2>
        <button 
          onClick={onCreateEstablishment}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2 bg-black text-white rounded-lg shadow-sm hover:bg-neutral-800 transition font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-xl font-bold">+</span> 
          {loading ? 'Creando...' : 'Nuevo establecimiento'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {establishments.map(establishment => (
          <EstablishmentCard key={establishment.id} establishment={establishment} />
        ))}
        
        {/* Card para crear nuevo */}
        <button 
          onClick={onCreateEstablishment}
          disabled={loading}
          className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-400 rounded-2xl p-6 hover:bg-neutral-100 transition min-h-[110px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-3xl text-neutral-800 font-bold">+</span>
          <span className="text-sm text-neutral-700 mt-1">Nuevo establecimiento</span>
        </button>
      </div>
    </section>
  );
});

// ✅ Componente individual de establecimiento
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