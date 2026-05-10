import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchCities } from "@/api/cities.api";
import { QUERY_KEYS } from "@/lib/constants";
import { getCityLabel } from "@/lib/format";
import { useDebounce } from "@/hooks/useDebounce";
import { Building2, Search, MapPin } from "lucide-react";
import "@/styles/components/ui.css";

export default function CitiesPage() {
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query);
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.cities(debounced || "all"),
    queryFn: () => searchCities({ q: debounced || undefined, limit: 30 }),
    staleTime: 10 * 60 * 1000,
  });

  return (
    <div className="trips-root">
      <div className="trips-header"><h1 className="trips-title">Explore Destinations</h1></div>
      <div className="dashboard-search" style={{ marginBottom: "var(--sp-xl)" }}>
        <span className="dashboard-search-icon" style={{ display: "flex" }}><Search size={18} /></span>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search cities, countries, or regions" />
      </div>
      {isLoading ? <div className="empty-state">Loading cities...</div> : (
        <div className="notes-grid">
          {(data?.cities ?? []).map((city) => (
            <div key={city.id} className="card card-hover">
              <div className="city-card-icon" style={{ color: "var(--cl-accent)", marginBottom: "var(--sp-sm)" }}><Building2 size={32} /></div>
              <h3 className="note-card-title">{city.name}</h3>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)", fontSize: "var(--fs-xs)", color: "var(--cl-text-muted)" }}>
                <MapPin size={12} /> {getCityLabel(city)}
              </div>
              <p style={{ color: "var(--cl-text-muted)", fontSize: "var(--fs-xs)" }}>{city.bestSeason || city.costIndex || "Destination data available"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
