// components/PageHeader.tsx
import React from 'react';

export const PageHeader: React.FC = () => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Biblioteca de Materiales Acústicos
      </h1>
      <p className="text-gray-600">
        Propiedades según norma ISO 12354-4 para cálculos acústicos en recintos 3D
      </p>
    </div>
  );
};