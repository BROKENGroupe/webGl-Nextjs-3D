// components/AbsorptionChart.tsx
import React from 'react';
import { AcousticIndex } from '../types/materials';
import { FREQUENCY_BANDS } from '../data';

interface AbsorptionChartProps {
  absorption: AcousticIndex[];
  title: string;
}

export const AbsorptionChart: React.FC<AbsorptionChartProps> = ({ absorption, title }) => {
  const maxValue = Math.max(...absorption.map(a => a.value_R));
  
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="text-sm font-medium text-gray-700 mb-3">{title}</h4>
      <div className="flex items-end space-x-1 h-20">
        {absorption.map((value, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div
              className="w-full bg-blue-500 rounded-t"
              style={{ height: `${(value.value_R / maxValue) * 100}%` }}
            />
            <span className="text-xs text-gray-500 mt-1">
              {FREQUENCY_BANDS[index]}
            </span>
            <span className="text-xs font-medium">
              {value.value_R.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};