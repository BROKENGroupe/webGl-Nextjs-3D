"use client"

import { useState, useCallback } from "react"

export interface ToolPanelState {
  isOpen: boolean
  currentTool: string
  shapeCount: number
  viewMode: "2d" | "3d"
}

export function useToolPanel() {
  const [state, setState] = useState<ToolPanelState>({
    isOpen: true,
    currentTool: "polygon",
    shapeCount: 0,
    viewMode: "3d"
  })

  const togglePanel = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: !prev.isOpen }))
  }, [])

  const selectTool = useCallback((tool: string) => {
    setState(prev => ({ ...prev, currentTool: tool }))
  }, [])

  const updateShapeCount = useCallback((count: number) => {
    setState(prev => ({ ...prev, shapeCount: count }))
  }, [])

  const setViewMode = useCallback((mode: "2d" | "3d") => {
    setState(prev => ({ ...prev, viewMode: mode }))
  }, [])

  const resetToDefaults = useCallback(() => {
    setState({
      isOpen: true,
      currentTool: "polygon",
      shapeCount: 0,
      viewMode: "2d"
    })
  }, [])

  return {
    state,
    actions: {
      togglePanel,
      selectTool,
      updateShapeCount,
      setViewMode,
      resetToDefaults
    }
  }
}