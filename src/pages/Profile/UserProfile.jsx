import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listTrips } from "@/api/trips.api";
import { getUserAvatarUrl } from "@/lib/avatar";
import { QUERY_KEYS, ROUTES } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";
import "@/styles/components/profile.css";
import "@/styles/components/ui.css";
import { Map } from "lucide-react";

export default function UserProfilePage() {
  const user = useAuthStore((s) => s.user);
  const avatarUrl = user ? getUserAvatarUrl(user) : "";
  const { data } = useQuery({ queryKey: QUERY_KEYS.trips({ profile: true }), queryFn: () => listTrips({ limit: 6 }) });
  const trips = data?.trips ?? [];

  return (
    <div className="profile-root">
      <div className="profile-header-card">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar">{user && <img src={avatarUrl} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}</div>
        </div>
        <div className="profile-header-info">
          <h1 className="profile-user-name">{user?.name || "Traveller"}</h1>
          <div className="profile-user-email">{user?.email || "No email"}</div>
          <div className="profile-stats-row">
            <div className="profile-stat"><div className="profile-stat-value">{data?.meta?.total ?? trips.length}</div><div className="profile-stat-label">Trips</div></div>
            <div className="profile-stat"><div className="profile-stat-value">{user?.travelerProfile || "solo"}</div><div className="profile-stat-label">Profile</div></div>
            <div className="profile-stat"><div className="profile-stat-value">{user?.isAdmin ? "Yes" : "No"}</div><div className="profile-stat-label">Admin</div></div>
          </div>
        </div>
      </div>

      <div className="profile-grid">
        <div className="profile-form-card">
          <h2 className="profile-form-section-title">Account Information</h2>
          <div className="input-wrap" style={{ marginBottom: "var(--sp-md)" }}><label className="input-label">Name</label><input className="input" value={user?.name || ""} readOnly /></div>
          <div className="input-wrap" style={{ marginBottom: "var(--sp-md)" }}><label className="input-label">Email</label><input className="input" value={user?.email || ""} readOnly /></div>
          <div className="input-wrap" style={{ marginBottom: "var(--sp-md)" }}><label className="input-label">Phone</label><input className="input" value={user?.phoneNumber || "Not added"} readOnly /></div>
          <p style={{ color: "var(--cl-text-muted)", fontSize: "var(--fs-sm)" }}>The backend currently exposes profile retrieval through auth/me. Profile editing is not listed in the backend README, so this page avoids fake saves.</p>
        </div>

        <div className="profile-trips-panel">
          <div className="profile-trips-panel-title" style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><Map size={18} /> Recent Trips</div>
          {trips.map((trip) => <Link key={trip.id} to={ROUTES.tripDetail(trip.id)} className="profile-trip-item"><div className="profile-trip-thumb"><Map size={24} /></div><div className="profile-trip-name">{trip.title}</div></Link>)}
          {trips.length === 0 && <div style={{ color: "var(--cl-text-muted)", fontSize: "var(--fs-xs)" }}>No trips yet</div>}
        </div>
      </div>
    </div>
  );
}
