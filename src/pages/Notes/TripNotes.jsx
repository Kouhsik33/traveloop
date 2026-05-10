import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createNote, deleteNote, listNotes, updateNote } from "@/api/notes.api";
import { getApiErrorMessage } from "@/api/client";
import { QUERY_KEYS, ROUTES } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { useToast } from "@/components/shared/toast-context";
import { SkeletonCard } from "@/components/shared/Skeleton";
import "@/styles/components/notes.css";
import "@/styles/components/ui.css";
import { CheckCircle, Star, StickyNote, Trash2, ArrowLeft, PenLine, Clock, Tag } from "lucide-react";

export default function TripNotesPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [filter, setFilter] = useState("all");
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState({ title: "", content: "", noteType: "general", isImportant: false });
  
  const { data, isLoading } = useQuery({ queryKey: QUERY_KEYS.notes(id ?? ""), queryFn: () => listNotes(id), enabled: Boolean(id) });
  const notes = data?.notes ?? [];
  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notes(id ?? "") });
  
  const createMutation = useMutation({ 
    mutationFn: (body) => createNote(id, body), 
    onSuccess: () => { setDraft({ title: "", content: "", noteType: "general", isImportant: false }); setComposing(false); invalidate(); showToast("Note saved.", "success"); }, 
    onError: (err) => showToast(getApiErrorMessage(err), "error") 
  });
  
  const deleteMutation = useMutation({ mutationFn: (noteId) => deleteNote(id, noteId), onSuccess: () => { invalidate(); showToast("Note deleted.", "success"); }, onError: (err) => showToast(getApiErrorMessage(err), "error") });
  const importantMutation = useMutation({ mutationFn: ({ noteId, body }) => updateNote(id, noteId, body), onSuccess: invalidate, onError: (err) => showToast(getApiErrorMessage(err), "error") });
  
  const visibleNotes = notes.filter((n) => filter === "all" || n.noteType === filter);

  const addNote = () => {
    if (!draft.title.trim() || !draft.content.trim()) return showToast("Title and content are required.", "error");
    createMutation.mutate(draft);
  };

  return (
    <div className="notes-root" style={{ maxWidth: "1200px", margin: "0 auto", paddingBottom: "var(--sp-4xl)" }}>
      
      {/* ── Header ────────────────────────────────────── */}
      <div style={{ marginBottom: "var(--sp-2xl)", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "var(--sp-lg)" }}>
        <div>
          <Link to={ROUTES.tripDetail(id)} style={{ display: "inline-flex", alignItems: "center", gap: "var(--sp-xs)", color: "var(--cl-text-muted)", textDecoration: "none", fontSize: "var(--fs-sm)", fontWeight: "var(--fw-medium)", marginBottom: "var(--sp-md)", transition: "color var(--tr-fast)" }} className="hover-accent">
            <ArrowLeft size={16} /> Back to Trip Overview
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-sm)", marginBottom: "var(--sp-xs)" }}>
            <StickyNote size={28} color="var(--cl-accent)" />
            <h1 className="notes-title" style={{ fontSize: "var(--fs-3xl)", margin: 0 }}>Trip Notes</h1>
          </div>
          <p style={{ color: "var(--cl-text-muted)", fontSize: "var(--fs-lg)", margin: 0 }}>Store ideas, tips, and important information for your journey.</p>
        </div>
        
        <button className="btn btn-primary" onClick={() => setComposing((c) => !c)} style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}>
          {composing ? "Cancel" : <><PenLine size={16} /> New Note</>}
        </button>
      </div>

      {/* ── Compose Area ──────────────────────────────── */}
      {composing && (
        <div className="card" style={{ marginBottom: "var(--sp-2xl)", border: "1px solid var(--cl-accent)", boxShadow: "0 0 0 4px rgba(224, 122, 95, 0.1)", animation: "fade-in 0.3s ease-out" }}>
          <h2 style={{ fontSize: "var(--fs-lg)", margin: "0 0 var(--sp-lg) 0", display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><PenLine size={18} color="var(--cl-accent)" /> Write a Note</h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "var(--sp-md)", marginBottom: "var(--sp-md)" }}>
            <div className="input-wrap">
              <label className="input-label">Title</label>
              <input className="input" value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} placeholder="e.g. Best cafes in the area" />
            </div>
            <div className="input-wrap">
              <label className="input-label">Category</label>
              <select className="input" value={draft.noteType} onChange={(e) => setDraft((d) => ({ ...d, noteType: e.target.value }))}>
                <option value="general">General</option>
                <option value="tips">Travel Tips</option>
                <option value="bookings">Bookings</option>
                <option value="contacts">Contacts</option>
                <option value="food">Food & Dining</option>
              </select>
            </div>
          </div>
          
          <div className="input-wrap" style={{ marginBottom: "var(--sp-md)" }}>
            <label className="input-label">Content</label>
            <textarea className="input" rows={6} value={draft.content} onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))} placeholder="Write down anything you want to remember..." style={{ resize: "vertical" }} />
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "var(--sp-lg)", paddingTop: "var(--sp-md)", borderTop: "1px solid var(--cl-bg-subtle)" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)", cursor: "pointer", color: draft.isImportant ? "var(--cl-warm)" : "var(--cl-text-muted)", fontWeight: "var(--fw-medium)" }}>
              <input type="checkbox" checked={draft.isImportant} onChange={(e) => setDraft((d) => ({ ...d, isImportant: e.target.checked }))} style={{ accentColor: "var(--cl-warm)" }} /> 
              <Star size={16} fill={draft.isImportant ? "currentColor" : "none"} /> Mark as Important
            </label>
            <button className="btn btn-primary" onClick={addNote} disabled={createMutation.isPending || !draft.title.trim() || !draft.content.trim()}>
              <CheckCircle size={16} /> Save Note
            </button>
          </div>
        </div>
      )}

      {/* ── Toolbar ───────────────────────────────────── */}
      <div className="notes-toolbar" style={{ display: "flex", gap: "var(--sp-sm)", marginBottom: "var(--sp-xl)", overflowX: "auto", paddingBottom: "4px" }}>
        {["all", "general", "tips", "bookings", "food"].map((f) => (
          <button 
            key={f} 
            className={`notes-filter-btn${filter === f ? " active" : ""}`} 
            onClick={() => setFilter(f)}
            style={{ 
              padding: "6px 16px", 
              borderRadius: "var(--br-full)", 
              border: filter === f ? "none" : "1px solid var(--cl-border)", 
              background: filter === f ? "var(--cl-text)" : "var(--cl-surface)", 
              color: filter === f ? "var(--cl-bg)" : "var(--cl-text-muted)",
              fontSize: "var(--fs-sm)",
              fontWeight: "var(--fw-medium)",
              cursor: "pointer",
              transition: "all var(--tr-fast)",
              whiteSpace: "nowrap"
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Notes Grid ────────────────────────────────── */}
      {isLoading ? (
        <div className="notes-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "var(--sp-lg)" }}>
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} imageHeight="0" style={{ height: "200px" }} />)}
        </div>
      ) : visibleNotes.length === 0 ? (
        <div className="empty-state" style={{ background: "var(--cl-surface)", borderRadius: "var(--br-2xl)", padding: "var(--sp-4xl) var(--sp-xl)" }}>
          <div style={{ background: "var(--cl-bg-subtle)", width: "80px", height: "80px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto var(--sp-lg) auto" }}>
            <StickyNote size={32} color="var(--cl-text-muted)" />
          </div>
          <div className="empty-state-title" style={{ fontSize: "var(--fs-2xl)", fontWeight: "var(--fw-bold)", marginBottom: "var(--sp-xs)" }}>No notes yet</div>
          <p style={{ color: "var(--cl-text-muted)", fontSize: "var(--fs-lg)", maxWidth: "400px", margin: "0 auto var(--sp-xl) auto" }}>Keep track of important details, bookings, and tips for your trip.</p>
          {!composing && <button className="btn btn-primary btn-lg" onClick={() => setComposing(true)}>Write your first note</button>}
        </div>
      ) : (
        <div className="notes-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "var(--sp-lg)" }}>
          {visibleNotes.map((note) => (
            <div key={note.id} className="card note-card" style={{ display: "flex", flexDirection: "column", padding: "var(--sp-xl)", border: note.isImportant ? "1px solid var(--cl-warm)" : "1px solid var(--cl-border)", background: note.isImportant ? "rgba(244, 162, 97, 0.03)" : "var(--cl-surface)", borderRadius: "var(--br-xl)", position: "relative", transition: "transform var(--tr-fast), box-shadow var(--tr-fast)" }}>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--sp-md)", gap: "var(--sp-sm)" }}>
                <h3 className="note-card-title" style={{ fontSize: "var(--fs-lg)", margin: 0, fontWeight: "var(--fw-bold)", color: "var(--cl-text)" }}>{note.title}</h3>
                <button className="btn btn-ghost btn-icon" onClick={() => importantMutation.mutate({ noteId: note.id, body: { isImportant: !note.isImportant } })} style={{ color: note.isImportant ? "var(--cl-warm)" : "var(--cl-border)", padding: 0, minWidth: 0, height: "auto" }}>
                  <Star size={20} fill={note.isImportant ? "currentColor" : "none"} />
                </button>
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)", color: "var(--cl-accent)", fontSize: "var(--fs-xs)", fontWeight: "var(--fw-bold)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--sp-md)" }}>
                <Tag size={12} /> {note.noteType}
              </div>
              
              <p className="note-card-body" style={{ color: "var(--cl-text-muted)", fontSize: "var(--fs-md)", lineHeight: 1.6, margin: "0 0 var(--sp-xl) 0", whiteSpace: "pre-wrap", flex: 1 }}>{note.content}</p>
              
              <div className="note-card-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "var(--sp-md)", borderTop: "1px solid var(--cl-bg-subtle)", marginTop: "auto" }}>
                <span className="note-card-date" style={{ color: "rgba(244,241,222,0.4)", fontSize: "var(--fs-xs)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Clock size={12} /> {formatDate(note.createdAt)}
                </span>
                <div className="note-card-actions">
                  <button className="btn btn-ghost btn-icon" onClick={() => window.confirm("Delete this note?") && deleteMutation.mutate(note.id)} style={{ color: "var(--cl-error)", padding: "4px" }} title="Delete Note">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
