import { useQuery } from "@tanstack/react-query";
import { getDestinationImage } from "@/api/destinationImages.api";

const memoryCache = new Map();

export function useDestinationImage(city) {
  return useQuery({
    queryKey: ["destination-image", city],
    queryFn: async ({ signal }) => {
      if (memoryCache.has(city)) return memoryCache.get(city);
      const image = await getDestinationImage(city, { signal });
      memoryCache.set(city, image);
      return image;
    },
    enabled: typeof city === "string" && city !== "default" && city.trim().length > 1,
    staleTime: 1000 * 60 * 60 * 12,
    gcTime: 1000 * 60 * 60 * 24,
    retry: 1,
  });
}
