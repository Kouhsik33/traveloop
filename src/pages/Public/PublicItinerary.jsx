import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { getPublicTrip } from "@/api/public.api";
import { ROUTES } from "@/lib/constants";
import { formatDate, getTripBudget, usd } from "@/lib/format";
import { Map, Globe, Calendar, Banknote } from "lucide-react";
import "@/styles/components/itinerary.css";
import "@/styles/components/ui.css";

export default function PublicItineraryPage() {
  const { slug } = useParams();
  const { data: trip, isLoading, isError } = useQuery({ queryKey: ["public-trip", slug ?? ""], queryFn: () => getPublicTrip(slug), enabled: Boolean(slug) });

  if (isLoading) return <div className="itinerary-view-root"><div className="empty-state">Loading public trip...</div></div>;
  if (isError || !trip) {
    return (
      <div className="itinerary-view-root" style={{ textAlign: "center", padding: "var(--sp-3xl) var(--sp-xl)" }}>
        <div style={{ color: "var(--cl-text-muted)", marginBottom: "var(--sp-md)", display: "flex", justifyContent: "center" }}><Map size={64} /></div>
        <h1 className="itinerary-view-title" style={{ color: "var(--cl-text)" }}>Itinerary Unavailable</h1>
        <p style={{ color: "var(--cl-text-muted)", marginBottom: "var(--sp-xl)" }}>This itinerary may be private or the link is invalid.</p>
        <Link to={ROUTES.landing} className="btn btn-primary">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="itinerary-view-root" style={{ background: "var(--cl-bg)", minHeight: "100vh" }}>
      <div style={{ background: "var(--cl-accent)", color: "#fff", padding: "var(--sp-xs) var(--sp-md)", fontSize: "var(--fs-xs)", fontWeight: "var(--fw-bold)", textAlign: "center", textTransform: "uppercase" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--sp-xs)" }}><Globe size={14} /> Public Travel-Loop Trip</span>
      </div>
      <div className="itinerary-view-header">
        <h1 className="itinerary-view-title">{trip.title}</h1>
        {trip.description && <p style={{ color: "rgba(244,241,222,0.7)", maxWidth: "40rem", marginInline: "auto" }}>{trip.description}</p>}
        <div style={{ display: "flex", gap: "var(--sp-lg)", justifyContent: "center", marginTop: "var(--sp-xl)", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><Calendar size={16} /> {formatDate(trip.startDate)} to {formatDate(trip.endDate)}</div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><Banknote size={16} /> {getTripBudget(trip) ? usd(getTripBudget(trip)) : "Budget private"}</div>
        </div>
        <div style={{ marginTop: "var(--sp-xl)", display: "flex", justifyContent: "center", gap: "var(--sp-md)" }}>
          <Link to={ROUTES.signup} className="btn btn-primary btn-lg">Plan Your Own Trip</Link>
          <Link to={ROUTES.login} className="btn btn-secondary btn-lg">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
