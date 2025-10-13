"use client";
import React from 'react';

//   Loader con efecto de onda
export function WaveLoader({ message = "Cargando..." }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="flex space-x-1 justify-center items-center mb-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1s'
              }}
            ></div>
          ))}
        </div>
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
}

//   Loader con círculo pulsante
export function PulseLoader({ message = "Cargando..." }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 w-16 h-16 border-4 border-blue-200 rounded-full animate-ping opacity-75"></div>
          <div className="relative w-16 h-16 border-4 border-blue-500 rounded-full"></div>
        </div>
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
}

//   Loader minimalista con línea
export function LineLoader({ message = "Cargando..." }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md">
        <div className="w-32 h-1 bg-gray-200 rounded-full mx-auto mb-6 overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full animate-pulse w-full"></div>
        </div>
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
}

//   Loader con rotación suave
export function SoftSpinLoader({ message = "Cargando..." }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="relative w-12 h-12 mx-auto mb-6">
          <div className="absolute inset-0 w-12 h-12 border-3 border-gray-200 rounded-full"></div>
          <div className="absolute inset-0 w-12 h-12 border-3 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
}