import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listTrips } from "@/api/trips.api";
import { searchCities } from "@/api/cities.api";
import { QUERY_KEYS, ROUTES } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";
import { formatDate, getCityLabel, getTripBudget, usd } from "@/lib/format";
import "@/styles/components/dashboard.css";
import "@/styles/components/ui.css";
import { Calendar, Globe, Hand, Map, MapPin, Plus, Search, Sparkles, User } from "lucide-react";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: tripsData, isLoading } = useQuery({ queryKey: QUERY_KEYS.trips({ limit: 6 }), queryFn: () => listTrips({ limit: 6, sort: "createdAt" }) });
  const { data: citiesData } = useQuery({ queryKey: QUERY_KEYS.cities("dashboard"), queryFn: () => searchCities({ limit: 8 }), staleTime: 10 * 60 * 1000 });
  const trips = tripsData?.trips ?? [];
  const firstName = user?.name?.split(" ")[0] || "Traveller";

  return (
    <div className="dashboard-root">
      <div className="dashboard-header">
        <div className="dashboard-greeting">
          <span className="dashboard-greeting-label">Welcome back</span>
          <h1 className="dashboard-greeting-name" style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}>Hey, {firstName} <Hand size={28} color="var(--cl-warm)" /></h1>
          <p className="dashboard-greeting-sub">Your account, trips, cities, and AI tools are connected to the backend.</p>
        </div>
        <Link to={ROUTES.tripNew} className="btn btn-primary btn-lg">+ Plan New Trip</Link>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card stat-card-peach"><div className="stat-icon"><Map size={24} /></div><div className="stat-value">{tripsData?.meta?.total ?? trips.length}</div><div className="stat-label">Trips Planned</div></div>
        <div className="stat-card stat-card-warm"><div className="stat-icon"><Globe size={24} /></div><div className="stat-value">{citiesData?.meta?.total ?? 0}</div><div className="stat-label">Seeded Cities</div></div>
        <div className="stat-card stat-card-teal"><div className="stat-icon"><Sparkles size={24} /></div><div className="stat-value">3</div><div className="stat-label">AI Endpoints</div></div>
      </div>

      <div className="dashboard-search">
        <span className="dashboard-search-icon" style={{ display: "flex" }}><Search size={18} /></span>
        <input placeholder="Search destinations, trips, or activities" onFocus={(e) => e.currentTarget.blur()} />
        <Link to={ROUTES.search} className="btn btn-accent btn-sm" style={{ color: "var(--cl-accent)", fontSize: "var(--fs-xs)" }}>Search</Link>
      </div>

      <div className="dashboard-grid">
        <div>
          <div className="dashboard-hero-banner">
            <div className="dashboard-banner-content">
              <div className="dashboard-banner-label" style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><Sparkles size={16} /> AI ready</div>
              <h2 className="dashboard-banner-title">Build a real backend itinerary</h2>
              <p className="dashboard-banner-sub">Create a trip, add stops from the city database, then generate itinerary, packing, and budget ideas.</p>
              <Link to={ROUTES.tripNew} className="btn btn-primary">Start Planning</Link>
            </div>
          </div>

          <div className="dashboard-section-title"><span>Recent Trips</span><Link to={ROUTES.trips} style={{ fontSize: "var(--fs-sm)", color: "var(--cl-accent)", fontWeight: "var(--fw-medium)" }}>View all</Link></div>
          {isLoading ? <div className="empty-state">Loading trips...</div> : trips.length > 0 ? (
            <div className="trip-cards-row">
              {trips.slice(0, 3).map((trip) => (
                <Link key={trip.id} to={ROUTES.tripDetail(trip.id)} className="trip-mini-card">
                  <div className="trip-mini-thumb"><Map size={24} /></div>
                  <div className="trip-mini-body">
                    <div className="trip-mini-name">{trip.title}</div>
                    <div className="trip-mini-place" style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><MapPin size={12} /> {trip.tripType}</div>
                    <div className="trip-mini-dates" style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><Calendar size={12} /> {formatDate(trip.startDate)} to {formatDate(trip.endDate)}</div>
                    {getTripBudget(trip) > 0 && <div className="trip-mini-dates">{usd(getTripBudget(trip))}</div>}
                  </div>
                </Link>
              ))}
            </div>
          ) : <div className="empty-state"><div className="empty-state-icon"><Map size={48} /></div><div className="empty-state-title">No trips yet</div><Link to={ROUTES.tripNew} className="btn btn-primary">Plan a Trip</Link></div>}

          <div className="dashboard-section-title" style={{ marginTop: "var(--sp-xl)" }}><span>Explore Destinations</span></div>
          <div className="dest-row">
            {(citiesData?.cities ?? []).map((city) => <Link key={city.id} to={ROUTES.cities} className="dest-pill"><span className="dest-pill-emoji" style={{ display: "flex" }}><MapPin size={20} /></span><span className="dest-pill-name">{getCityLabel(city)}</span></Link>)}
          </div>
        </div>

        <div className="quick-actions-panel">
          <div className="quick-action-card">
            <div className="dashboard-section-title" style={{ marginBottom: "var(--sp-md)" }}>Quick Actions</div>
            {[{ icon: Plus, label: "New Trip", to: ROUTES.tripNew }, { icon: Search, label: "Explore", to: ROUTES.search }, { icon: User, label: "My Profile", to: ROUTES.profile }, { icon: Globe, label: "Community", to: ROUTES.community }].map((a) => (
              <Link key={a.label} to={a.to} style={{ display: "flex", alignItems: "center", gap: "var(--sp-md)", padding: "var(--sp-sm) var(--sp-md)", borderRadius: "var(--br-lg)", marginBottom: "var(--sp-xs)", fontSize: "var(--fs-sm)", fontWeight: "var(--fw-medium)", color: "var(--cl-text)", textDecoration: "none" }}>
                <span style={{ display: "flex", color: "var(--cl-accent)" }}><a.icon size={18} /></span>{a.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
