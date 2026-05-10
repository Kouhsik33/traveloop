import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createMedia, deleteMedia, listMedia, signUpload } from "@/api/media.api";
import { getApiErrorMessage } from "@/api/client";
import { QUERY_KEYS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { useToast } from "@/components/shared/toast-context";
import "@/styles/components/ui.css";
import { Image as ImageIcon, Trash2, Upload } from "lucide-react";

export default function TripMediaPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [draft, setDraft] = useState({ mediaType: "photo", cloudinaryUrl: "", cloudinaryId: "", caption: "" });
  const { data: media = [], isLoading } = useQuery({ queryKey: QUERY_KEYS.media(id ?? ""), queryFn: () => listMedia(id), enabled: Boolean(id) });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.media(id ?? "") });
  const createMutation = useMutation({
    mutationFn: (body) => createMedia(id, body),
    onSuccess: () => { setDraft({ mediaType: "photo", cloudinaryUrl: "", cloudinaryId: "", caption: "" }); invalidate(); },
    onError: (err) => showToast(getApiErrorMessage(err), "error"),
  });
  const deleteMutation = useMutation({ mutationFn: (mediaId) => deleteMedia(id, mediaId), onSuccess: invalidate, onError: (err) => showToast(getApiErrorMessage(err), "error") });
  const signMutation = useMutation({ mutationFn: () => signUpload(), onSuccess: () => showToast("Cloudinary upload signature created. Use it in your uploader.", "success"), onError: (err) => showToast(getApiErrorMessage(err), "error") });

  const submit = (e) => {
    e.preventDefault();
    if (!draft.cloudinaryUrl.trim() || !draft.cloudinaryId.trim()) return showToast("Cloudinary URL and ID are required.", "error");
    createMutation.mutate({ ...draft, caption: draft.caption || undefined });
  };

  return (
    <div className="trips-root">
      <div className="trips-header">
        <h1 className="trips-title">Trip Gallery</h1>
        <button className="btn btn-secondary" onClick={() => signMutation.mutate()}><Upload size={16} /> Sign Upload</button>
      </div>
      <form className="card" onSubmit={submit} style={{ display: "grid", gap: "var(--sp-sm)", marginBottom: "var(--sp-lg)" }}>
        <select className="input" value={draft.mediaType} onChange={(e) => setDraft((d) => ({ ...d, mediaType: e.target.value }))}><option value="photo">photo</option><option value="video">video</option></select>
        <input className="input" value={draft.cloudinaryUrl} onChange={(e) => setDraft((d) => ({ ...d, cloudinaryUrl: e.target.value }))} placeholder="Cloudinary URL" />
        <input className="input" value={draft.cloudinaryId} onChange={(e) => setDraft((d) => ({ ...d, cloudinaryId: e.target.value }))} placeholder="Cloudinary public ID" />
        <input className="input" value={draft.caption} onChange={(e) => setDraft((d) => ({ ...d, caption: e.target.value }))} placeholder="Caption" />
        <button className="btn btn-primary">Save Media Record</button>
      </form>
      {isLoading ? <div className="empty-state">Loading media...</div> : media.length === 0 ? <div className="empty-state"><ImageIcon size={48} /> No media yet.</div> : (
        <div className="notes-grid">
          {media.map((item) => (
            <div key={item.id} className="card">
              {item.mediaType === "photo" ? <img src={item.cloudinaryUrl} alt={item.caption || "Trip media"} style={{ width: "100%", aspectRatio: "16 / 10", objectFit: "cover", borderRadius: "var(--br-md)", marginBottom: "var(--sp-sm)" }} /> : <a href={item.cloudinaryUrl}>Open video</a>}
              <h3 className="note-card-title">{item.caption || item.cloudinaryId}</h3>
              <p style={{ color: "var(--cl-text-muted)" }}>{formatDate(item.createdAt)}</p>
              <button className="btn btn-ghost btn-xs" style={{ color: "var(--cl-error)" }} onClick={() => deleteMutation.mutate(item.id)}><Trash2 size={16} /> Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
