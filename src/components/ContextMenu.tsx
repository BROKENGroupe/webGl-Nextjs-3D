"use client";

import React, { useState, useEffect, useRef } from 'react';

interface ContextMenuProps {
  x: number;
  y: number;
  visible: boolean;
  onClose: () => void;
  onDelete: () => void;
  itemType: 'line' | 'vertex' | null;
  itemIndex: number | null;
}

export function ContextMenu({ 
  x, 
  y, 
  visible, 
  onClose, 
  onDelete, 
  itemType, 
  itemIndex 
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
      if (event.key === 'Delete' || event.key === 'Backspace') {
        onDelete();
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      // Hacer foco en el menú para capturar teclas
      if (menuRef.current) {
        menuRef.current.focus();
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [visible, onClose, onDelete]);

  if (!visible) return null;

  const getMenuTitle = () => {
    if (itemType === 'line') return `Línea ${(itemIndex || 0) + 1}`;
    if (itemType === 'vertex') return `Vértice ${(itemIndex || 0) + 1}`;
    return 'Elemento';
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg min-w-48 focus:outline-none"
      style={{
        left: x,
        top: y,
        transform: 'translate(0, 0)'
      }}
      tabIndex={-1}
    >
      {/* Encabezado del menú */}
      <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 rounded-t-lg">
        <span className="text-sm font-medium text-gray-700">
          {getMenuTitle()}
        </span>
      </div>

      {/* Opciones del menú */}
      <div className="py-1">
        <button
          onClick={() => {
            onDelete();
            onClose();
          }}
          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center space-x-2 transition-colors"
        >
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
            />
          </svg>
          <span>Eliminar</span>
          <span className="ml-auto text-xs text-gray-400">Del</span>
        </button>

        {itemType === 'vertex' && (
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
          >
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
              />
            </svg>
            <span>Editar posición</span>
          </button>
        )}

        <div className="border-t border-gray-200 my-1"></div>
        
        <button
          onClick={onClose}
          className="w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
        >
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M6 18L18 6M6 6l12 12" 
            />
          </svg>
          <span>Cancelar</span>
          <span className="ml-auto text-xs text-gray-400">Esc</span>
        </button>
      </div>
    </div>
  );
}
