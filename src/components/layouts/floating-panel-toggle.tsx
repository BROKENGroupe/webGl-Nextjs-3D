"use client"


import { Button } from "@/shared/ui/button"
import { Home, X } from "lucide-react"

interface FloatingPanelToggleProps {
  isOpen: boolean
  onToggle: () => void
}

export function FloatingPanelToggle({ isOpen, onToggle }: FloatingPanelToggleProps) {
  return (
    <div className={`fixed top-4 z-50 transition-all duration-300 ${
      isOpen ? 'right-84' : 'right-4'
    }`}>
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-2 shadow-lg backdrop-blur-sm"
      >
        {isOpen ? (
          <>
            <X className="h-4 w-4 mr-2" />
            Ocultar
          </>
        ) : (
          <>
            <Home className="h-4 w-4 mr-2" />
            Panel
          </>
        )}
      </Button>
    </div>
  )
}

