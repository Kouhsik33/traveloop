function getImageApiBaseUrl() {
  const raw = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  if (typeof raw === "string" && raw.length > 0) return raw.replace(/\/$/, "");
  return "http://localhost:5000";
}

export async function getDestinationImage(city, { signal } = {}) {
  const params = new URLSearchParams({ city });
  const response = await fetch(`${getImageApiBaseUrl()}/api/city-image?${params.toString()}`, {
    signal,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Destination image request failed");
  }

  return response.json();
}
