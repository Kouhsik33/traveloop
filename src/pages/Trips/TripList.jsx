import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listTrips } from "@/api/trips.api";
import { ROUTES, QUERY_KEYS } from "@/lib/constants";
import { formatDate, getTripBudget, usd } from "@/lib/format";
import "@/styles/components/trips.css";
import "@/styles/components/ui.css";
import { CheckCircle, Clock, Search, Map, Calendar, Banknote, ChevronRight, MapPinned } from "lucide-react";

const STATUS_META = {
  planning: { label: "Planning", icon: MapPinned, dot: "dot-upcoming" },
  confirmed: { label: "Confirmed", icon: MapPinned, dot: "dot-upcoming" },
  ongoing: { label: "Ongoing", icon: Clock, dot: "dot-ongoing" },
  completed: { label: "Completed", icon: CheckCircle, dot: "dot-completed" },
};

export default function TripListPage() {
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  const filters = {
    page: 1,
    limit: 50,
    sort: "startDate",
    ...(status !== "all" ? { status } : {}),
    ...(query.trim() ? { search: query.trim() } : {}),
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: QUERY_KEYS.trips(filters),
    queryFn: () => listTrips(filters),
    keepPreviousData: true,
  });

  const trips = data?.trips ?? [];

  return (
    <div className="trips-root">
      <div className="trips-header">
        <h1 className="trips-title">My Trips</h1>
        <Link to={ROUTES.tripNew} className="btn btn-primary">+ Plan New Trip</Link>
      </div>

      <div style={{ display: "flex", gap: "var(--sp-sm)", alignItems: "center", marginBottom: "var(--sp-lg)" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "var(--sp-sm)", background: "var(--cl-bg-alt)", border: "1.5px solid var(--cl-border)", borderRadius: "var(--br-xl)", padding: "var(--sp-xs) var(--sp-md)" }}>
          <Search size={18} color="var(--cl-text-muted)" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search trips" style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: "var(--fs-sm)", color: "var(--cl-text)", fontFamily: "var(--font-body)" }} />
        </div>
      </div>

      <div className="trips-filters">
        {["all", "planning", "confirmed", "ongoing", "completed"].map((s) => (
          <button key={s} className={`filter-tab${status === s ? " active" : ""}`} onClick={() => setStatus(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="empty-state">Loading trips...</div>
      ) : isError ? (
        <div className="empty-state">Unable to load trips. Check that the backend is running and you are signed in.</div>
      ) : trips.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Map size={48} /></div>
          <div className="empty-state-title">No trips found</div>
          <p style={{ color: "var(--cl-text-muted)", fontSize: "var(--fs-sm)" }}>{query ? `No results for "${query}"` : "Start planning your first adventure."}</p>
          <Link to={ROUTES.tripNew} className="btn btn-primary">Plan a Trip</Link>
        </div>
      ) : (
        <div>
          {trips.map((trip) => {
            const meta = STATUS_META[trip.status] ?? STATUS_META.planning;
            return (
              <Link key={trip.id} to={ROUTES.tripDetail(trip.id)} className="trip-list-card">
                <div className="trip-list-thumb"><meta.icon size={24} /></div>
                <div>
                  <div className="trip-list-name">{trip.title}</div>
                  <div className="trip-list-meta">
                    <span className="trip-list-meta-item"><span className={`trip-section-dot ${meta.dot}`} /> {meta.label}</span>
                    <span className="trip-list-meta-item"><Calendar size={14} /> {formatDate(trip.startDate)} to {formatDate(trip.endDate)}</span>
                    {getTripBudget(trip) > 0 && <span className="trip-list-meta-item"><Banknote size={14} /> {usd(getTripBudget(trip))}</span>}
                  </div>
                </div>
                <span style={{ color: "var(--cl-text-muted)" }}><ChevronRight size={20} /></span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
