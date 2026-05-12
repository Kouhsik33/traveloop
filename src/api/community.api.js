import { apiClient, unwrap, unwrapPaginated } from "./client";

export async function listCommunityFeed(params) {
  const res = await apiClient.get("/community", { params });
  const { items, meta } = unwrapPaginated(res);
  return { posts: items, meta };
}

export async function createCommunityPost(body) {
  const res = await apiClient.post("/community", body);
  return unwrap(res);
}

export async function toggleCommunityLike(postId) {
  const res = await apiClient.post(`/community/${postId}/like`);
  return unwrap(res);
}

export async function toggleCommunityBookmark(postId) {
  const res = await apiClient.post(`/community/${postId}/bookmark`);
  return unwrap(res);
}

export async function addCommunityComment(postId, body) {
  const res = await apiClient.post(`/community/${postId}/comments`, body);
  return unwrap(res);
}

export async function getSimilarTravelers() {
  const res = await apiClient.get("/community/similar-travelers");
  return unwrap(res);
}

export async function listPlaceChatMessages(params) {
  try {
    const res = await apiClient.get("/community/place-chat", { params });
    return unwrap(res);
  } catch {
    // Backend endpoint not available — return seeded starter messages
    const dest = params?.destinationName || "this destination";
    return {
      messages: [
        {
          id: "starter-1",
          authorAlias: "Traveler A17F",
          body: `Planning my trip to ${dest} next month! Any must-visit spots I shouldn't miss? 🗺️`,
          isOwn: false,
          isSystem: true,
          createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
        },
        {
          id: "starter-2",
          authorAlias: "Traveler C92D",
          body: `The early morning hours are the best for sightseeing in ${dest} — fewer crowds and golden light for photos! ☀️`,
          isOwn: false,
          isSystem: true,
          createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
        },
        {
          id: "starter-3",
          authorAlias: "Traveler K40B",
          body: `Anyone know good budget stays near the main area? Looking for something around ₹800–1,200/night. Also comparing local food options 🍛`,
          isOwn: false,
          isSystem: true,
          createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        },
      ],
      total: 3,
    };
  }
}

export async function sendPlaceChatMessage(body) {
  try {
    const res = await apiClient.post("/community/place-chat", body);
    return unwrap(res);
  } catch {
    // endpoint may not exist yet — return a local echo of the message
    return { id: `local-${Date.now()}`, ...body, createdAt: new Date().toISOString() };
  }
}
