import { useQuery } from "@tanstack/react-query";
import { getPlacesWorkspaceAction } from "@/actions/place/place.actions";
import { Building2 } from "lucide-react";

export function usePlacesSection(modules?: any) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["places"],
    queryFn: getPlacesWorkspaceAction,
  });

  const placesData = Array.isArray(data) ? data : [];

  console.log("Fetched places data:", placesData);

  const safeModules = Array.isArray(modules) ? modules : [];

  // Estructura para permisos y navMainItems
  const placesSection = [
    {
      title: "Mis Establecimientos",
      url: "#",
      icon: Building2,
      items: [
        ...placesData.map((place: any) => ({
          title: place.name,
          url: `/places/${place.id}`,
          permission: "places:view",
          id: place.id,
          address: place.address,
          simulations: place.simulations,
        })),
      ],
    },
  ];

  return { placesSection, isLoading, error, placesData, safeModules };
}
