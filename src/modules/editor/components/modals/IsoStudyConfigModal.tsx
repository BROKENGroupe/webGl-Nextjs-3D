import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent } from "@/shared/ui/dialog";
import React, { useState } from "react";

interface IsoStudyConfigModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (config: {
    height: number;
    venueType: string;
  }) => void;
}

const venueTypes = [
  { value: "discoteca", label: "Discoteca" },
  { value: "bar", label: "Bar" },
  { value: "restaurante", label: "Restaurante" }
];

export const IsoStudyConfigModal: React.FC<IsoStudyConfigModalProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  const [height, setHeight] = useState<number>(2.7);
  const [venueType, setVenueType] = useState<string>("discoteca");
  const [isoConfig, setIsoConfig] = useState<{ height: number; venueType: string }>({
    height: 2.7,
    venueType: "discoteca",
  });

  // Actualiza el estado isoConfig cuando cambian los inputs
  const handleHeightChange = (value: number) => {
    setHeight(value);
    setIsoConfig((prev) => ({ ...prev, height: value }));
  };

  const handleVenueTypeChange = (value: string) => {
    setVenueType(value);
    setIsoConfig((prev) => ({ ...prev, venueType: value }));
  };

  const handleConfirm = () => {
    onConfirm(isoConfig);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="space-y-4 mt-2 w-[30vw]">
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Altura del recinto (m)
              </label>
              <input
                type="number"
                min={2}
                max={6}
                step={0.01}
                value={height}
                onChange={(e) => handleHeightChange(Number(e.target.value))}
                placeholder="Ej: 2.70"
                className="w-full border rounded px-2 py-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de recinto
              </label>
              <div className="flex gap-3">
                {venueTypes.map((type) => (
                  <div
                    key={type.value}
                    onClick={() => handleVenueTypeChange(type.value)}
                    style={{
                      border:
                        venueType === type.value ? "2px solid #3b82f6" : "1px solid #ccc",
                      borderRadius: 8,
                      padding: "12px 18px",
                      cursor: "pointer",
                      background:
                        venueType === type.value ? "#e0e7ff" : "#fff",
                      fontWeight: 500,
                      color: "#222",
                      transition: "border 0.2s, background 0.2s",
                    }}
                  >
                    {type.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={onClose}>Cancelar</Button>
            <Button color="primary" onClick={handleConfirm}>
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
