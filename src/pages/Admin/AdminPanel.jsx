import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { listTrips } from "@/api/trips.api";
import { searchCities } from "@/api/cities.api";
import { sendEmail, sendSms, sendWhatsApp } from "@/api/notifications.api";
import { getApiErrorMessage } from "@/api/client";
import { QUERY_KEYS } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/shared/toast-context";
import "@/styles/components/admin.css";
import "@/styles/components/ui.css";
import { Globe, Mail, Map, MessageSquare, Settings } from "lucide-react";

export default function AdminPanelPage() {
  const user = useAuthStore((s) => s.user);
  const { showToast } = useToast();
  const [channel, setChannel] = useState("email");
  const [form, setForm] = useState({ to: "", subject: "", message: "" });
  const { data: tripsData } = useQuery({ queryKey: QUERY_KEYS.trips({ admin: true }), queryFn: () => listTrips({ limit: 1 }) });
  const { data: citiesData } = useQuery({ queryKey: QUERY_KEYS.cities("admin"), queryFn: () => searchCities({ limit: 1 }), staleTime: 10 * 60 * 1000 });

  const notifyMutation = useMutation({
    mutationFn: () => {
      if (channel === "email") return sendEmail({ to: form.to, subject: form.subject || "Traveloop notification", text: form.message });
      if (channel === "sms") return sendSms({ to: form.to, message: form.message });
      return sendWhatsApp({ to: form.to, message: form.message });
    },
    onSuccess: () => showToast("Notification request sent.", "success"),
    onError: (err) => showToast(getApiErrorMessage(err), "error"),
  });

  const submit = (e) => {
    e.preventDefault();
    if (!form.to.trim() || !form.message.trim()) return showToast("Recipient and message are required.", "error");
    notifyMutation.mutate();
  };

  return (
    <div className="admin-root">
      <div className="admin-header">
        <h1 className="admin-title">Admin Panel</h1>
        <span className="badge badge-teal" style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><Settings size={14} /> {user?.isAdmin ? "Admin Access" : "Signed in user"}</span>
      </div>
      <div className="admin-stats-grid">
        <div className="stat-card stat-card-peach"><div className="stat-icon"><Map size={24} /></div><div className="stat-value">{tripsData?.meta?.total ?? 0}</div><div className="stat-label">Owned Trips</div></div>
        <div className="stat-card stat-card-teal"><div className="stat-icon"><Globe size={24} /></div><div className="stat-value">{citiesData?.meta?.total ?? 0}</div><div className="stat-label">Cities</div></div>
        <div className="stat-card stat-card-indigo"><div className="stat-icon"><MessageSquare size={24} /></div><div className="stat-value">3</div><div className="stat-label">Notification Channels</div></div>
      </div>
      <div className="card">
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: "var(--fw-bold)", marginBottom: "var(--sp-lg)", fontSize: "var(--fs-md)" }}>
          Admin Notifications
        </h2>
        <p style={{ color: "var(--cl-text-muted)", fontSize: "var(--fs-sm)" }}>These backend endpoints are admin-only. Non-admin users will receive the backend authorization error.</p>
        <form onSubmit={submit} style={{ display: "grid", gap: "var(--sp-md)", marginTop: "var(--sp-md)" }}>
          <select className="input" value={channel} onChange={(e) => setChannel(e.target.value)}>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
          <input className="input" value={form.to} onChange={(e) => setForm((f) => ({ ...f, to: e.target.value }))} placeholder={channel === "email" ? "user@example.com" : "+15551234567"} />
          {channel === "email" && <input className="input" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} placeholder="Subject" />}
          <textarea className="input" rows={4} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} placeholder="Message" />
          <button className="btn btn-primary" disabled={notifyMutation.isPending}><Mail size={16} /> Send Notification</button>
        </form>
      </div>
    </div>
  );
}
