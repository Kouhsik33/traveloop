import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTrip } from "@/api/trips.api";
import { createPackingItem, deletePackingItem, listPackingItems, updatePackingItem } from "@/api/packing.api";
import { generatePackingList } from "@/api/ai.api";
import { getApiErrorMessage } from "@/api/client";
import { QUERY_KEYS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { useToast } from "@/components/shared/toast-context";
import "@/styles/components/packing.css";
import "@/styles/components/ui.css";
import { Luggage, PartyPopper, Package, Sparkles, Trash2 } from "lucide-react";

function daysBetween(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.round((end - start) / 86400000) + 1;
  return Number.isFinite(days) && days > 0 ? days : 1;
}

export default function PackingChecklistPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [draft, setDraft] = useState({ name: "", category: "general" });

  const { data: trip } = useQuery({ queryKey: QUERY_KEYS.trip(id ?? ""), queryFn: () => getTrip(id), enabled: Boolean(id) });
  const { data: items = [], isLoading } = useQuery({ queryKey: QUERY_KEYS.packing(id ?? ""), queryFn: () => listPackingItems(id), enabled: Boolean(id) });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.packing(id ?? "") });

  const createMutation = useMutation({
    mutationFn: (body) => createPackingItem(id, body),
    onSuccess: () => { setDraft({ name: "", category: "general" }); invalidate(); },
    onError: (err) => showToast(getApiErrorMessage(err), "error"),
  });
  const updateMutation = useMutation({ mutationFn: ({ itemId, body }) => updatePackingItem(id, itemId, body), onSuccess: invalidate, onError: (err) => showToast(getApiErrorMessage(err), "error") });
  const deleteMutation = useMutation({ mutationFn: (itemId) => deletePackingItem(id, itemId), onSuccess: invalidate, onError: (err) => showToast(getApiErrorMessage(err), "error") });
  const aiMutation = useMutation({
    mutationFn: () => generatePackingList({
      destination: trip?.title || "the trip",
      days: daysBetween(formatDate(trip?.startDate), formatDate(trip?.endDate)),
      tripType: trip?.tripType || "solo",
      season: trip?.vibe || undefined,
    }),
    onSuccess: async (groups) => {
      for (const group of groups) {
        for (const item of group.items || []) {
          await createPackingItem(id, { name: item, category: group.category || "ai", isPacked: false, aiSuggested: true });
        }
      }
      invalidate();
      showToast("AI packing list added.", "success");
    },
    onError: (err) => showToast(getApiErrorMessage(err), "error"),
  });

  const grouped = useMemo(() => items.reduce((acc, item) => {
    const key = item.category || "general";
    acc[key] = [...(acc[key] || []), item];
    return acc;
  }, {}), [items]);
  const packed = items.filter((item) => item.isPacked).length;
  const pct = items.length ? Math.round((packed / items.length) * 100) : 0;

  const addItem = (e) => {
    e.preventDefault();
    if (!draft.name.trim()) return;
    createMutation.mutate({ name: draft.name.trim(), category: draft.category.trim() || "general", isPacked: false });
  };

  return (
    <div className="packing-root">
      <div className="packing-header">
        <h1 className="packing-title">Packing Checklist</h1>
        <button className="btn btn-primary btn-sm" disabled={aiMutation.isPending} onClick={() => aiMutation.mutate()}><Sparkles size={16} /> Generate List</button>
      </div>

      <div className="packing-progress-wrap">
        <div className="packing-progress-info">
          <div className="packing-progress-label" style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><Luggage size={16} /> Packing Progress</div>
          <div className="packing-progress-title">{packed} of {items.length} items packed</div>
          <div className="packing-progress-sub">{pct === 100 && items.length ? <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--sp-xs)" }}><PartyPopper size={14} /> You're all packed.</span> : `${items.length - packed} items remaining`}</div>
          <div className="packing-progress-track"><div className="packing-progress-fill" style={{ width: `${pct}%` }} /></div>
        </div>
      </div>

      <form className="card" onSubmit={addItem} style={{ display: "flex", gap: "var(--sp-sm)", flexWrap: "wrap" }}>
        <input className="input" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="Item name" style={{ flex: "2 1 14rem" }} />
        <input className="input" value={draft.category} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))} placeholder="Category" style={{ flex: "1 1 10rem" }} />
        <button className="btn btn-primary">+ Add Item</button>
      </form>

      {isLoading ? <div className="empty-state">Loading items...</div> : Object.keys(grouped).length === 0 ? <div className="empty-state">No packing items yet.</div> : Object.entries(grouped).map(([category, groupItems]) => (
        <div key={category} className="packing-group">
          <div className="packing-group-header">
            <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-sm)" }}><Package size={18} /><span className="packing-group-title">{category}</span></div>
            <span className="packing-group-count">{groupItems.filter((i) => i.isPacked).length}/{groupItems.length}</span>
          </div>
          <div className="packing-items-list">
            {groupItems.map((item) => (
              <label key={item.id} className={`packing-item${item.isPacked ? " packed" : ""}`}>
                <input type="checkbox" className="packing-checkbox" checked={item.isPacked} onChange={() => updateMutation.mutate({ itemId: item.id, body: { isPacked: !item.isPacked } })} />
                <span className="packing-item-name">{item.name}{item.aiSuggested ? " (AI)" : ""}</span>
                <button type="button" className="btn btn-ghost btn-xs" style={{ marginLeft: "auto", color: "var(--cl-error)" }} onClick={() => deleteMutation.mutate(item.id)}><Trash2 size={14} /></button>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
