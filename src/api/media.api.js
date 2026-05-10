import { apiClient, unwrap } from "./client";

export async function signUpload(body = { folder: "traveloop", resourceType: "auto" }) {
  const res = await apiClient.post(`/media/sign`, body);
  return unwrap(res);
}

export async function listMedia(tripId) {
  const res = await apiClient.get(`/trips/${tripId}/media`);
  return unwrap(res);
}

export async function createMedia(tripId, body) {
  const res = await apiClient.post(`/trips/${tripId}/media`, body);
  return unwrap(res);
}

export async function deleteMedia(tripId, mediaId) {
  await apiClient.delete(`/trips/${tripId}/media/${mediaId}`);
}
