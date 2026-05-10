import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteTrip, getTrip, publishTrip } from "@/api/trips.api";
import { getApiErrorMessage } from "@/api/client";
import { QUERY_KEYS, ROUTES } from "@/lib/constants";
import { formatDate, getTripBudget, usd } from "@/lib/format";
import { useToast } from "@/components/shared/toast-context";
import { SearchX, Calendar, Banknote, Luggage, StickyNote, MapPin, FileText, Image as ImageIcon, Share2, Trash2 } from "lucide-react";
import "@/styles/components/trips.css";
import "@/styles/components/ui.css";

export default function TripDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: trip, isLoading, isError } = useQuery({
    queryKey: QUERY_KEYS.trip(id ?? ""),
    queryFn: () => getTrip(id),
    enabled: Boolean(id),
  });

  const publishMutation = useMutation({
    mutationFn: () => publishTrip(id, !trip?.isPublic),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.trip(id ?? "") });
      showToast(result.publicSlug ? `Public link ready: /public/trips/${result.publicSlug}` : "Trip is private again.", "success");
    },
    onError: (err) => showToast(getApiErrorMessage(err), "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteTrip(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      navigate(ROUTES.trips, { replace: true });
    },
    onError: (err) => showToast(getApiErrorMessage(err), "error"),
  });

  if (isLoading) return <div className="trips-root"><div className="empty-state">Loading trip...</div></div>;

  if (isError || !trip) {
    return (
      <div className="trips-root" style={{ textAlign: "center", padding: "var(--sp-3xl) var(--sp-xl)" }}>
        <div style={{ color: "var(--cl-text-muted)", marginBottom: "var(--sp-md)" }}><SearchX size={64} /></div>
        <h1 className="trips-title">Trip Not Found</h1>
        <p style={{ color: "var(--cl-text-muted)", marginBottom: "var(--sp-xl)" }}>This trip may have been deleted or belongs to another account.</p>
        <Link to={ROUTES.trips} className="btn btn-primary">Back to My Trips</Link>
      </div>
    );
  }

  const managementLinks = [
    { label: "Itinerary Builder", icon: Calendar, to: ROUTES.tripItinerary(trip.id), desc: "Add stops, dates, accommodation, and activities" },
    { label: "Budget Breakdown", icon: Banknote, to: ROUTES.tripBudget(trip.id), desc: "Review backend budget totals and AI estimates" },
    { label: "Packing Checklist", icon: Luggage, to: ROUTES.tripPacking(trip.id), desc: "Save checklist items and AI suggestions" },
    { label: "Trip Notes", icon: StickyNote, to: ROUTES.tripNotes(trip.id), desc: "Store notes against the trip" },
    { label: "Trip Documents", icon: FileText, to: ROUTES.tripDocs(trip.id), desc: "Reference important document links" },
    { label: "Trip Gallery", icon: ImageIcon, to: ROUTES.tripMedia(trip.id), desc: "Create and manage media records" },
  ];

  return (
    <div className="trips-root">
      <div style={{ background: "linear-gradient(135deg, var(--cl-surface) 0%, var(--cl-surface-2) 100%)", borderRadius: "var(--br-2xl)", padding: "var(--sp-2xl)", border: "1px solid var(--cl-border-surface)", marginBottom: "var(--sp-xl)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "var(--sp-md)" }}>
          <div>
            <div style={{ fontSize: "var(--fs-xs)", fontWeight: "var(--fw-semibold)", color: "var(--cl-warm)", textTransform: "uppercase", marginBottom: "var(--sp-sm)" }}>Trip Overview</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-lg)", fontWeight: "var(--fw-extrabold)", color: "var(--cl-text-on-surface)" }}>{trip.title}</h1>
            <div style={{ display: "flex", gap: "var(--sp-md)", marginTop: "var(--sp-md)", color: "rgba(244,241,222,0.75)", fontSize: "var(--fs-sm)", flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><MapPin size={16} /> {trip.tripType}</span>
              <span style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><Calendar size={16} /> {formatDate(trip.startDate)} to {formatDate(trip.endDate)}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "var(--sp-sm)", flexWrap: "wrap" }}>
            <span className="badge badge-warm">{trip.status?.toUpperCase() || "PLANNING"}</span>
            <button className="btn btn-surface btn-sm" disabled={publishMutation.isPending} onClick={() => publishMutation.mutate()}><Share2 size={16} /> {trip.isPublic ? "Unpublish" : "Publish"}</button>
            <button className="btn btn-surface btn-sm" disabled={deleteMutation.isPending} onClick={() => window.confirm("Delete this trip?") && deleteMutation.mutate()}><Trash2 size={16} /> Delete</button>
          </div>
        </div>
      </div>

      <div className="dashboard-section-title"><span>Trip Management Hub</span></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(16rem, 1fr))", gap: "var(--sp-lg)", marginBottom: "var(--sp-2xl)" }}>
        {managementLinks.map((link) => (
          <Link key={link.to} to={link.to} className="card card-hover" style={{ textDecoration: "none", display: "flex", flexDirection: "column", gap: "var(--sp-sm)" }}>
            <div className="city-card-icon" style={{ color: "var(--cl-accent)" }}><link.icon size={32} /></div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-base)", fontWeight: "var(--fw-bold)", color: "var(--cl-text)" }}>{link.label}</div>
            <p style={{ fontSize: "var(--fs-xs)", color: "var(--cl-text-muted)", lineHeight: "var(--lh-body)" }}>{link.desc}</p>
            <div style={{ marginTop: "auto", fontSize: "var(--fs-xs)", color: "var(--cl-accent)", fontWeight: "var(--fw-semibold)" }}>Open Section</div>
          </Link>
        ))}
      </div>

      <div style={{ display: "flex", gap: "var(--sp-lg)", flexWrap: "wrap" }}>
        <div className="card" style={{ flex: 1, minWidth: "15rem", background: "var(--cl-bg-alt)" }}>
          <div style={{ fontSize: "var(--fs-xs)", color: "var(--cl-text-muted)", marginBottom: "var(--sp-xs)" }}>Total Budget</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-md)", fontWeight: "var(--fw-bold)", color: "var(--cl-teal)" }}>{usd(getTripBudget(trip))}</div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: "15rem", background: "var(--cl-bg-alt)" }}>
          <div style={{ fontSize: "var(--fs-xs)", color: "var(--cl-text-muted)", marginBottom: "var(--sp-xs)" }}>Public Link</div>
          <div style={{ fontSize: "var(--fs-sm)", color: "var(--cl-text)" }}>{trip.publicSlug ? `/public/trips/${trip.publicSlug}` : "Private"}</div>
        </div>
      </div>
    </div>
  );
}
