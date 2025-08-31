import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent } from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import React, { useState } from "react";


interface IsoStudyConfigModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (config: {
    height: number;
    studyType: string;
    Lp_in: number;
  }) => void;
}

const studyTypes = [
  { value: "iso12354-4", label: "ISO 12354-4 (Fachadas)" },
];

export const IsoStudyConfigModal: React.FC<IsoStudyConfigModalProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  const [height, setHeight] = useState<number>(2.7);
  const [studyType, setStudyType] = useState<string>("iso12354-4");
  const [Lp_in, setLp_in] = useState<number>(70);

  const handleConfirm = () => {
    onConfirm({ height, studyType, Lp_in });
    onClose();
  };

  return (
    <>
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>      
      <DialogContent>
        <div className="space-y-4 mt-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Altura del recinto (m)
            </label>
            <Input
              type="number"
              min={2}
              max={6}
              step={0.01}
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              placeholder="Ej: 2.70"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de estudio
            </label>
            <Select
              value={studyType}
              onValueChange={(value) => setStudyType(value)}
            >
              {studyTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nivel de presión sonora interior (Lp_in, dB)
            </label>
            <Input
              type="number"
              min={40}
              max={120}
              step={1}
              value={Lp_in}
              onChange={(e) => setLp_in(Number(e.target.value))}
              placeholder="Ej: 70"
            />
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
};
