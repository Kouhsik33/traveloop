import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { createTrip } from "@/api/trips.api";
import { getApiErrorMessage } from "@/api/client";
import { ROUTES } from "@/lib/constants";
import "@/styles/components/ui.css";
import { Rocket, AlertTriangle } from "lucide-react";

export default function CreateTripPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    coverPhotoUrl: "",
    startDate: "",
    endDate: "",
    tripType: "solo",
    budgetCapUsd: "",
    vibe: "comfort",
  });

  const mutation = useMutation({
    mutationFn: createTrip,
    onSuccess: (trip) => navigate(ROUTES.tripDetail(trip.id), { replace: true }),
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  const update = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const submit = (e) => {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) return setError("Trip name is required.");
    if (!form.startDate || !form.endDate) return setError("Start and end dates are required.");
    if (form.endDate < form.startDate) return setError("End date must be on or after the start date.");

    mutation.mutate({
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      coverPhotoUrl: form.coverPhotoUrl.trim() || undefined,
      startDate: form.startDate,
      endDate: form.endDate,
      tripType: form.tripType,
      budgetCapUsd: form.budgetCapUsd === "" ? undefined : Number(form.budgetCapUsd),
      vibe: form.vibe,
    });
  };

  return (
    <div className="create-trip-root">
      <div className="create-trip-form-card">
        <h1 className="create-trip-title">Plan a New Trip</h1>
        <p className="create-trip-sub">Create the trip shell first, then add cities, activities, notes, packing, and media.</p>

        {error && (
          <div className="input-error-msg" style={{ display: "flex", gap: "var(--sp-xs)", marginBottom: "var(--sp-md)" }}>
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        <form className="create-trip-fields" onSubmit={submit}>
          <div className="input-wrap">
            <label className="input-label" htmlFor="ct-title">Trip Name</label>
            <input id="ct-title" className="input" value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Rajasthan Loop" />
          </div>

          <div className="input-wrap">
            <label className="input-label" htmlFor="ct-description">Description</label>
            <textarea id="ct-description" className="input" rows={3} value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Optional trip notes" />
          </div>

          <div className="input-wrap">
            <label className="input-label" htmlFor="ct-cover">Cover Photo URL</label>
            <input id="ct-cover" className="input" value={form.coverPhotoUrl} onChange={(e) => update("coverPhotoUrl", e.target.value)} placeholder="https://example.com/photo.jpg" />
          </div>

          <div className="create-trip-row">
            <div className="input-wrap">
              <label className="input-label" htmlFor="ct-start">Start Date</label>
              <input id="ct-start" type="date" className="input" value={form.startDate} onChange={(e) => update("startDate", e.target.value)} />
            </div>
            <div className="input-wrap">
              <label className="input-label" htmlFor="ct-end">End Date</label>
              <input id="ct-end" type="date" className="input" value={form.endDate} min={form.startDate} onChange={(e) => update("endDate", e.target.value)} />
            </div>
          </div>

          <div className="create-trip-row">
            <div className="input-wrap">
              <label className="input-label" htmlFor="ct-type">Trip Type</label>
              <select id="ct-type" className="input" value={form.tripType} onChange={(e) => update("tripType", e.target.value)}>
                {["solo", "couple", "family", "group", "adventure", "pilgrimage", "honeymoon", "business"].map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="input-wrap">
              <label className="input-label" htmlFor="ct-vibe">Budget Style</label>
              <select id="ct-vibe" className="input" value={form.vibe} onChange={(e) => update("vibe", e.target.value)}>
                {["backpacker", "comfort", "luxury"].map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>

          <div className="input-wrap">
            <label className="input-label" htmlFor="ct-budget">Budget Cap (USD)</label>
            <input id="ct-budget" type="number" min="0" className="input" value={form.budgetCapUsd} onChange={(e) => update("budgetCapUsd", e.target.value)} placeholder="500" />
          </div>

          <div style={{ display: "flex", gap: "var(--sp-md)", marginTop: "var(--sp-sm)" }}>
            <Link to={ROUTES.trips} className="btn btn-secondary" style={{ flex: 1, justifyContent: "center" }}>Cancel</Link>
            <button type="submit" className="btn btn-primary" disabled={mutation.isPending} style={{ flex: 2, display: "flex", gap: "var(--sp-xs)", alignItems: "center", justifyContent: "center" }}>
              {mutation.isPending ? "Creating..." : <>Create Trip <Rocket size={18} /></>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
