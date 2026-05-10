import { apiClient, unwrap } from "./client";

export async function getTripRoute(tripId) {
  const res = await apiClient.get(`/maps/trips/${tripId}/route`);
  return unwrap(res);
}
