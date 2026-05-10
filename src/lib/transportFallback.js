/**
 * Mirrors backend fallback transport when `/destinations/transport/search` fails
 * (offline API, older deployed server, etc.). Values are indicative only.
 */
export function buildFallbackTransportRoutes({ origin, destination, departureDate, mode }) {
  const modes = mode === "all" ? ["flight", "train", "bus"] : [mode];
  return modes.flatMap((m, idx) => {
    const base = m === "flight" ? 7200 : m === "train" ? 1450 : 900;
    const duration = m === "flight" ? "2h 05m" : m === "train" ? "8h 20m" : "10h 10m";
    const operator =
      m === "flight"
        ? "IndiGo / Air India"
        : m === "train"
          ? "Indian Railways"
          : "State transport & private buses";
    return [0, 1].map((slot) => ({
      id: `fallback-${m}-${idx}-${slot}`,
      mode: m,
      operator,
      origin,
      destination,
      departureDate,
      departureTime: slot === 0 ? "06:30" : "19:15",
      arrivalTime: slot === 0 ? "09:05" : "22:10",
      duration,
      estimatedPriceInr: base + slot * (m === "flight" ? 2100 : 550),
      routeSummary: `${origin} → ${destination} (${m}) — sample timings; connect Skyscanner/IRCTC/RedBus for live inventory.`,
      isSampleData: true
    }));
  });
}
