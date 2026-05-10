import { apiClient, unwrap } from "./client";
export async function getPublicTrip(slug) {
    const res = await apiClient.get(`/public/trips/${slug}`);
    return unwrap(res);
}
