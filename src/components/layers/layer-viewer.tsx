import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SpeakerLoudIcon, CubeIcon, EyeOpenIcon, EyeNoneIcon } from "@radix-ui/react-icons";

type Layer = {
  key: string;
  label: string;
  icon: React.ReactNode;
};

const LAYERS: Layer[] = [
  { key: "sources", label: "Fuentes", icon: <SpeakerLoudIcon /> },
  { key: "heatmap", label: "Mapa de calor", icon: <EyeOpenIcon /> },
  { key: "cube", label: "Cubo 3D", icon: <CubeIcon /> },
];

export type LayerVisibility = Record<string, boolean>;

export function LayerViewer({
  visibility,
  onChange,
  selected,
  onSelect,
}: {
  visibility: LayerVisibility;
  onChange: (v: LayerVisibility) => void;
  selected?: string;
  onSelect?: (key: string) => void;
}) {
  const [order, setOrder] = useState<string[]>(LAYERS.map((l) => l.key));

  // Simulación de mover capa arriba
  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const newOrder = [...order];
    [newOrder[idx - 1], newOrder[idx]] = [newOrder[idx], newOrder[idx - 1]];
    setOrder(newOrder);
  };

  // Simulación de mover capa abajo
  const moveDown = (idx: number) => {
    if (idx === order.length - 1) return;
    const newOrder = [...order];
    [newOrder[idx + 1], newOrder[idx]] = [newOrder[idx], newOrder[idx + 1]];
    setOrder(newOrder);
  };

  return (
    <Card className="w-64 bg-background/95 backdrop-blur">
      <CardHeader>
        <CardTitle>Capas</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col-reverse gap-2">
          {order.map((key, idx) => {
            const layer = LAYERS.find((l) => l.key === key)!;
            const isSelected = selected === key;
            return (
              <li
                key={layer.key}
                className={`
                  flex items-center justify-between rounded-md px-2 py-1
                  border transition
                  ${isSelected ? "border-primary bg-primary/10" : "border-transparent hover:bg-muted"}
                  cursor-pointer group
                `}
                onClick={() => onSelect?.(layer.key)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{layer.icon}</span>
                  <span className="text-sm">{layer.label}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    tabIndex={-1}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange({ ...visibility, [layer.key]: !visibility[layer.key] });
                    }}
                  >
                    {visibility[layer.key] ? <EyeOpenIcon /> : <EyeNoneIcon />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    tabIndex={-1}
                    onClick={(e) => {
                      e.stopPropagation();
                      moveUp(idx);
                    }}
                    disabled={idx === 0}
                  >
                    <span className="inline-block rotate-180 select-none">↑</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    tabIndex={-1}
                    onClick={(e) => {
                      e.stopPropagation();
                      moveDown(idx);
                    }}
                    disabled={idx === order.length - 1}
                  >
                    <span className="inline-block select-none">↑</span>
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}