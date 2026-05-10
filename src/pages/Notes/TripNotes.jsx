import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createNote, deleteNote, listNotes, updateNote } from "@/api/notes.api";
import { getApiErrorMessage } from "@/api/client";
import { QUERY_KEYS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { useToast } from "@/components/shared/toast-context";
import "@/styles/components/notes.css";
import "@/styles/components/ui.css";
import { CheckCircle, Star, StickyNote, Trash2 } from "lucide-react";

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
  const createMutation = useMutation({ mutationFn: (body) => createNote(id, body), onSuccess: () => { setDraft({ title: "", content: "", noteType: "general", isImportant: false }); setComposing(false); invalidate(); }, onError: (err) => showToast(getApiErrorMessage(err), "error") });
  const deleteMutation = useMutation({ mutationFn: (noteId) => deleteNote(id, noteId), onSuccess: invalidate, onError: (err) => showToast(getApiErrorMessage(err), "error") });
  const importantMutation = useMutation({ mutationFn: ({ noteId, body }) => updateNote(id, noteId, body), onSuccess: invalidate, onError: (err) => showToast(getApiErrorMessage(err), "error") });
  const visibleNotes = notes.filter((n) => filter === "all" || n.noteType === filter);

  const addNote = () => {
    if (!draft.title.trim() || !draft.content.trim()) return showToast("Title and content are required.", "error");
    createMutation.mutate(draft);
  };

  return (
    <div className="notes-root">
      <div className="notes-header">
        <h1 className="notes-title">Trip Notes</h1>
        <button className="btn btn-primary" onClick={() => setComposing((c) => !c)}>{composing ? "Cancel" : "+ New Note"}</button>
      </div>
      {composing && (
        <div className="card" style={{ marginBottom: "var(--sp-lg)" }}>
          <div className="input-wrap" style={{ marginBottom: "var(--sp-md)" }}><label className="input-label">Title</label><input className="input" value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} /></div>
          <div className="input-wrap" style={{ marginBottom: "var(--sp-md)" }}><label className="input-label">Type</label><input className="input" value={draft.noteType} onChange={(e) => setDraft((d) => ({ ...d, noteType: e.target.value }))} /></div>
          <textarea className="input" rows={4} value={draft.content} onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))} placeholder="Write your note" />
          <label style={{ display: "flex", gap: "var(--sp-xs)", marginTop: "var(--sp-md)" }}><input type="checkbox" checked={draft.isImportant} onChange={(e) => setDraft((d) => ({ ...d, isImportant: e.target.checked }))} /> Important</label>
          <div style={{ display: "flex", gap: "var(--sp-sm)", justifyContent: "flex-end", marginTop: "var(--sp-md)" }}><button className="btn btn-primary btn-sm" onClick={addNote}>Save Note <CheckCircle size={14} /></button></div>
        </div>
      )}
      <div className="notes-toolbar">
        {["all", "general", "tips", "bookings"].map((f) => <button key={f} className={`notes-filter-btn${filter === f ? " active" : ""}`} onClick={() => setFilter(f)}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>)}
      </div>
      {isLoading ? <div className="empty-state">Loading notes...</div> : visibleNotes.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon"><StickyNote size={48} /></div><div className="empty-state-title">No notes yet</div></div>
      ) : (
        <div className="notes-grid">
          {visibleNotes.map((note) => (
            <div key={note.id} className="note-card">
              <h3 className="note-card-title">{note.title}</h3>
              <p className="note-card-body">{note.content}</p>
              <div className="note-card-footer">
                <span className="note-card-date">{formatDate(note.createdAt)} - {note.noteType}</span>
                <div className="note-card-actions">
                  <button className="btn btn-ghost btn-xs" onClick={() => importantMutation.mutate({ noteId: note.id, body: { isImportant: !note.isImportant } })} style={{ color: note.isImportant ? "var(--cl-warm)" : "var(--cl-text-muted)" }}><Star size={16} /></button>
                  <button className="btn btn-ghost btn-xs" onClick={() => deleteMutation.mutate(note.id)} style={{ color: "var(--cl-error)" }}><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
