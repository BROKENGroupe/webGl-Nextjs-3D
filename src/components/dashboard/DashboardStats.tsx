import React, { memo } from 'react';
import { DashboardStats } from '@/types/dashboard';

interface DashboardStatsProps {
  stats: DashboardStats;
}

export const DashboardStatsComponent = memo(function DashboardStatsComponent({ 
  stats 
}: DashboardStatsProps) {
  return (
    <div className="flex gap-8 mb-12">
      {/* Estudios OK */}
      <div className="flex-1 bg-neutral-50 rounded-2xl p-6 flex items-center gap-4 shadow-sm min-h-[90px]">
        <div className="w-4 h-4 rounded-full bg-green-400 animate-pulse" />
        <div>
          <div className="text-2xl font-bold text-neutral-900">{stats.studiesOk}</div>
          <div className="text-sm text-neutral-600">Cumplen la norma</div>
        </div>
      </div>

      {/* Estudios en revisión */}
      <div className="flex-1 bg-neutral-50 rounded-2xl p-6 flex items-center gap-4 shadow-sm min-h-[90px]">
        <div className="w-4 h-4 rounded-full bg-yellow-300 animate-pulse" />
        <div>
          <div className="text-2xl font-bold text-neutral-900">{stats.studiesReview}</div>
          <div className="text-sm text-neutral-600">Por revisar</div>
        </div>
      </div>

      {/* Total estudios */}
      <div className="flex-1 bg-neutral-50 rounded-2xl p-6 flex items-center gap-4 shadow-sm min-h-[90px]">
        <div className="w-4 h-4 rounded-full bg-neutral-800" />
        <div>
          <div className="text-2xl font-bold text-neutral-900">{stats.totalStudies}</div>
          <div className="text-sm text-neutral-600">Total estudios</div>
        </div>
      </div>
    </div>
  );
});

DashboardStatsComponent.displayName = 'DashboardStatsComponent';