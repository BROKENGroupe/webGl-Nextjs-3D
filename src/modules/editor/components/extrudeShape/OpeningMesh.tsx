import React from "react";

export function OpeningMesh({
  position,
  opening,
  material,
  eventHandlers,
  indicatorMaterial,
  previewElements,
}: {
  position: [number, number, number];
  opening: any;
  material: any;
  eventHandlers: any;
  indicatorMaterial?: any;
  previewElements?: React.ReactNode;
}) {
  // Cambia el cursor a "move" cuando el mouse entra/sale del mesh principal
  const handlePointerEnter = () => {
    document.body.style.cursor = "move";
    if (eventHandlers?.onPointerEnter) eventHandlers.onPointerEnter();
  };
  const handlePointerLeave = () => {
    document.body.style.cursor = "default";
    if (eventHandlers?.onPointerLeave) eventHandlers.onPointerLeave();
  };

  return (
    <group>
      <mesh
        position={position}
        {...eventHandlers}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        <sphereGeometry args={[0.03]} />
        <primitive object={material} />
      </mesh>
      {/* Indicador */}
      <mesh position={[position[0], position[1] + 1, position[2]]}>
        <sphereGeometry args={[0.01]} />
        <primitive object={indicatorMaterial} />
      </mesh>
      {/* Preview extra */}
      {previewElements}
    </group>
  );
}