import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getTrip } from "@/api/trips.api";
import { estimateBudget } from "@/api/ai.api";
import { getApiErrorMessage } from "@/api/client";
import { QUERY_KEYS } from "@/lib/constants";
import { getCityLabel, getStopCity, usd } from "@/lib/format";
import { useBudget } from "@/hooks/useBudget";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useAuthStore } from "@/store/authStore";
import { buildAiContext } from "@/lib/aiContext";
import { updateProfile } from "@/api/auth.api";
import { useToast } from "@/components/shared/toast-context";
import "@/styles/components/budget.css";
import "@/styles/components/ui.css";
import { BarChart2, Lightbulb, AlertTriangle, Sparkles } from "lucide-react";

export default function BudgetBreakdownPage() {
  const { id } = useParams();
  const { showToast } = useToast();
  const user = useAuthStore((s) => s.user);
  const { requestLocation, isLocating } = useGeolocation();
  const { data: trip } = useQuery({ queryKey: QUERY_KEYS.trip(id ?? ""), queryFn: () => getTrip(id), enabled: Boolean(id) });
  const { data: budget, isLoading, isError } = useBudget(id);
  const firstCity = getStopCity(trip?.stops?.[0]);

  const aiMutation = useMutation({
    mutationFn: async () => {
      const coords = await requestLocation();
      if (coords) {
        await updateProfile({
          travelPreferences: {
            ...(user?.travelPreferences || {}),
            currentLocation: coords,
            locationCapturedAt: new Date().toISOString(),
          },
        }).catch(() => {});
      }
      return estimateBudget({
        cityId: firstCity.id,
        cityName: getCityLabel(firstCity),
        vibe: trip?.vibe || "comfort",
        tripType: trip?.tripType || "solo",
        userContext: buildAiContext(user, {
          currentLocation: coords || undefined,
          groupSize: trip?.tripType === "group" ? 4 : 1,
        }),
      });
    },
    onError: (err) => showToast(getApiErrorMessage(err), "error"),
  });

  const totalCap = budget?.totalBudgetCapInr ?? 0;
  const spent = budget?.totalSpentInr ?? 0;
  const pct = totalCap > 0 ? Math.min(Math.round((spent / totalCap) * 100), 100) : 0;

  return (
    <div className="budget-root">
      <div className="budget-header">
        <h1 className="budget-title">Budget Breakdown</h1>
        <button className="btn btn-primary" disabled={!firstCity || aiMutation.isPending || isLocating} onClick={() => aiMutation.mutate()}><Sparkles size={16} /> {isLocating ? "Locating..." : "AI Estimate"}</button>
      </div>

      {isLoading ? <div className="empty-state">Loading budget...</div> : isError ? (
        <div className="empty-state"><AlertTriangle size={32} /> Unable to load budget.</div>
      ) : (
        <>
          <div className="budget-summary-grid">
            <div className="budget-invoice-card">
              <div className="invoice-trip-meta">
                <div className="invoice-logo" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}><BarChart2 size={32} /></div>
                <div>
                  <div className="invoice-trip-name">{trip?.title || "Trip Budget"}</div>
                  <div className="invoice-trip-dates">{budget?.isOverBudget ? "Over budget" : "Within budget"}</div>
                </div>
                <div>
                  <div className="invoice-meta-label">Spent</div>
                  <div className="invoice-meta-value">{usd(spent)}</div>
                </div>
              </div>
            </div>

            <div className="budget-insight-card">
              <h3 className="budget-insight-title" style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><Lightbulb size={18} color="var(--cl-warm)" /> Budget Insights</h3>
              <div className="budget-ring-legend">
                <div className="budget-legend-item"><span className="legend-label">Total Budget</span><span className="legend-value">{totalCap ? usd(totalCap) : "Not set"}</span></div>
                <div className="budget-legend-item"><span className="legend-label">Spent</span><span className="legend-value" style={{ color: "var(--cl-accent)" }}>{usd(spent)}</span></div>
                <div className="budget-legend-item"><span className="legend-label">Remaining</span><span className="legend-value" style={{ color: "var(--cl-teal)" }}>{budget?.remainingInr == null ? "No cap" : usd(budget.remainingInr)}</span></div>
                <div className="budget-legend-item"><span className="legend-label">Used</span><span className="legend-value">{pct}%</span></div>
              </div>
            </div>
          </div>

          {aiMutation.data && (
            <div className="card" style={{ marginBottom: "var(--sp-lg)" }}>
              <h3 className="note-card-title">AI daily estimate for {aiMutation.data.cityName}</h3>
              <p>{usd(aiMutation.data.perDayInr)} per day: {usd(aiMutation.data.accommodationInr)} lodging, {usd(aiMutation.data.foodInr)} food, {usd(aiMutation.data.activitiesInr)} activities.</p>
            </div>
          )}

          <div className="budget-table-wrap">
            <table className="budget-table">
              <thead><tr><th>Date</th><th>City</th><th>Accommodation</th><th>Activities</th><th>Total</th></tr></thead>
              <tbody>
                {(budget?.byDay ?? []).map((row) => (
                  <tr key={row.stopId}>
                    <td>{row.date}</td>
                    <td>{row.cityName}</td>
                    <td>{usd(row.accommodationCostInr)}</td>
                    <td>{usd(row.activitiesCostInr)}</td>
                    <td>{usd(row.totalInr)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="notes-grid" style={{ marginTop: "var(--sp-lg)" }}>
            {(budget?.byCategory ?? []).map((row) => (
              <div className="card" key={row.category}>
                <h3 className="note-card-title">{row.category}</h3>
                <p>{usd(row.totalInr)} - {row.percentage}% of spend</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
