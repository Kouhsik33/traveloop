import { apiClient, unwrap } from "./client";

export async function getDestinationIntelligence(cityId) {
  const res = await apiClient.get(`/destinations/${cityId}/intelligence`);
  return unwrap(res);
}

export async function searchTransportOptions(params) {
  const res = await apiClient.get("/destinations/transport/search", { params });
  return unwrap(res);
}
