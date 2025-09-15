"use client"

import { useEffect } from "react"
import { toast } from "sonner"
import { CheckCircle } from "lucide-react"

export function WallsToast({ isExtruded, walls }: { isExtruded: boolean; walls: any[] }) {
  useEffect(() => {
    if (isExtruded && walls.length > 0) {
      toast.success(
        `${walls.length} pared${walls.length !== 1 ? "es" : ""} lista${walls.length !== 1 ? "s" : ""} para análisis`,
        {
          description: "📊 Haz clic en Análisis Acústico para ver resultados detallados",
          duration: 5000,
          icon: <CheckCircle className="text-green-500 w-5 h-5" />,
          className: "bg-white text-gray-800 rounded-xl shadow-lg border border-gray-200",
        }
      )
    }
  }, [isExtruded, walls])

  return null
}
