import { useQuery } from "@tanstack/react-query";
import { getTripRoute } from "@/api/maps.api";

export function useMap(tripId) {
  return useQuery({
    queryKey: ["trips", tripId, "route"],
    queryFn: () => getTripRoute(tripId),
    enabled: Boolean(tripId),
  });
}
