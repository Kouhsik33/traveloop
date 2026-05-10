import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createMedia, deleteMedia, listMedia, signUpload } from "@/api/media.api";
import { getApiErrorMessage } from "@/api/client";
import { QUERY_KEYS, ROUTES } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { useToast } from "@/components/shared/toast-context";
import { SkeletonCard } from "@/components/shared/Skeleton";
import "@/styles/components/ui.css";
import { Image as ImageIcon, Trash2, Upload, ArrowLeft, Camera, Video, AlertCircle } from "lucide-react";

export default function TripMediaPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  
  const { data: media = [], isLoading } = useQuery({ queryKey: QUERY_KEYS.media(id ?? ""), queryFn: () => listMedia(id), enabled: Boolean(id) });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.media(id ?? "") });
  
  const createMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Choose a photo or video first.");
      const isVideo = file.type.startsWith("video/");
      const resourceType = isVideo ? "video" : "image";
      const signature = await signUpload({ folder: `traveloop/trips/${id}`, resourceType });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signature.apiKey);
      formData.append("timestamp", String(signature.timestamp));
      formData.append("signature", signature.signature);
      formData.append("folder", signature.folder);

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${signature.cloudName}/${resourceType}/upload`, {
        method: "POST",
        body: formData,
      });
      const uploaded = await uploadRes.json();
      if (!uploadRes.ok || !uploaded.secure_url || !uploaded.public_id) {
        throw new Error(uploaded?.error?.message || "Upload failed.");
      }

      return createMedia(id, {
        mediaType: isVideo ? "video" : "photo",
        cloudinaryUrl: uploaded.secure_url,
        cloudinaryId: uploaded.public_id,
        caption: caption.trim() || undefined,
      });
    },
    onSuccess: () => { 
      setFile(null); 
      setCaption(""); 
      setPreviewUrl("");
      invalidate(); 
      showToast("Media uploaded to gallery.", "success"); 
    },
    onError: (err) => showToast(getApiErrorMessage(err), "error"),
  });
  
  const deleteMutation = useMutation({ mutationFn: (mediaId) => deleteMedia(id, mediaId), onSuccess: invalidate, onError: (err) => showToast(getApiErrorMessage(err), "error") });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setFile(null);
      setPreviewUrl("");
    }
  };

  const submit = (e) => {
    e.preventDefault();
    if (!file) return showToast("Choose a photo or video to upload.", "error");
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) return showToast("Only photos and videos are supported.", "error");
    if (file.size > 15 * 1024 * 1024) return showToast("Media must be 15 MB or smaller.", "error");
    createMutation.mutate();
  };

  return (
    <div className="trips-root" style={{ maxWidth: "1200px", margin: "0 auto", paddingBottom: "var(--sp-4xl)" }}>
      
      {/* ── Header ────────────────────────────────────── */}
      <div style={{ marginBottom: "var(--sp-2xl)", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "var(--sp-lg)" }}>
        <div>
          <Link to={ROUTES.tripDetail(id)} style={{ display: "inline-flex", alignItems: "center", gap: "var(--sp-xs)", color: "var(--cl-text-muted)", textDecoration: "none", fontSize: "var(--fs-sm)", fontWeight: "var(--fw-medium)", marginBottom: "var(--sp-md)", transition: "color var(--tr-fast)" }} className="hover-accent">
            <ArrowLeft size={16} /> Back to Trip Overview
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-sm)", marginBottom: "var(--sp-xs)" }}>
            <ImageIcon size={28} color="var(--cl-accent)" />
            <h1 className="trips-title" style={{ fontSize: "var(--fs-3xl)", margin: 0 }}>Trip Gallery</h1>
          </div>
          <p style={{ color: "var(--cl-text-muted)", fontSize: "var(--fs-lg)", margin: 0 }}>Store and share your favorite moments.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "var(--sp-3xl)", alignItems: "start" }}>
        
        {/* ── Main Gallery ──────────────────────────────── */}
        <div>
          {isLoading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "var(--sp-md)" }}>
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} imageHeight="200px" style={{ height: "260px" }} />)}
            </div>
          ) : media.length === 0 ? (
            <div className="empty-state" style={{ background: "var(--cl-surface)", borderRadius: "var(--br-2xl)", padding: "var(--sp-4xl) var(--sp-xl)", border: "1px dashed var(--cl-border)" }}>
              <div style={{ background: "var(--cl-bg-subtle)", width: "80px", height: "80px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto var(--sp-lg) auto" }}>
                <ImageIcon size={32} color="var(--cl-text-muted)" />
              </div>
              <div style={{ fontSize: "var(--fs-2xl)", fontWeight: "var(--fw-bold)", marginBottom: "var(--sp-xs)" }}>No media yet</div>
              <p style={{ color: "var(--cl-text-muted)", fontSize: "var(--fs-lg)", maxWidth: "400px", margin: "0 auto var(--sp-xl) auto" }}>Upload photos and videos to document your journey.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "var(--sp-lg)" }}>
              {media.map((item) => (
                <div key={item.id} className="card card-hover" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", border: "1px solid var(--cl-border)", background: "var(--cl-surface)", borderRadius: "var(--br-xl)" }}>
                  
                  <div style={{ width: "100%", aspectRatio: "4/3", background: "var(--cl-bg-subtle)", position: "relative" }}>
                    {item.mediaType === "photo" ? (
                      <img src={item.cloudinaryUrl} alt={item.caption || "Trip media"} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "var(--sp-sm)" }}>
                        <Video size={48} color="var(--cl-text-muted)" opacity={0.5} />
                        <a href={item.cloudinaryUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ textDecoration: "none" }}>Open Video</a>
                      </div>
                    )}
                    
                    <div style={{ position: "absolute", top: "8px", left: "8px", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", color: "white", padding: "4px 8px", borderRadius: "var(--br-sm)", fontSize: "0.6rem", fontWeight: "var(--fw-bold)", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "4px" }}>
                      {item.mediaType === "photo" ? <Camera size={12} /> : <Video size={12} />} {item.mediaType}
                    </div>
                  </div>
                  
                  <div style={{ padding: "var(--sp-md)", flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ fontSize: "var(--fs-sm)", fontWeight: "var(--fw-semibold)", color: "var(--cl-text)", marginBottom: "4px" }}>
                      {item.caption || "No caption"}
                    </div>
                    
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: "var(--sp-sm)", borderTop: "1px solid var(--cl-bg-subtle)" }}>
                      <span style={{ fontSize: "var(--fs-xs)", color: "var(--cl-text-muted)" }}>{formatDate(item.createdAt)}</span>
                      <button className="btn btn-ghost btn-icon" style={{ width: "24px", height: "24px", padding: 0, color: "var(--cl-text-muted)", opacity: 0.6, ':hover': { opacity: 1, color: "var(--cl-error)" } }} onClick={() => window.confirm("Delete this item?") && deleteMutation.mutate(item.id)} title="Delete media">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Upload Sidebar ────────────────────────────── */}
        <div style={{ position: "sticky", top: "var(--sp-2xl)" }}>
          <form className="card" onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "var(--sp-md)", background: "var(--cl-surface)", border: "1px solid var(--cl-border)", boxShadow: "var(--shadow-sm)" }}>
            <h3 style={{ fontSize: "var(--fs-lg)", margin: "0 0 var(--sp-xs) 0", display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}>
              <Upload size={20} color="var(--cl-accent)" /> Upload Media
            </h3>
            
            <div style={{ border: file ? "1px solid var(--cl-teal)" : "2px dashed var(--cl-border)", background: file ? "rgba(42, 157, 143, 0.05)" : "var(--cl-bg-subtle)", borderRadius: "var(--br-lg)", padding: "var(--sp-lg)", textAlign: "center", position: "relative", transition: "all var(--tr-fast)" }}>
              <input id="trip-media-file" type="file" accept="image/*,video/*" onChange={handleFileChange} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }} />
              
              {file ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--sp-sm)" }}>
                  {file.type.startsWith("image/") ? (
                    <img src={previewUrl} alt="Preview" style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "var(--br-md)", boxShadow: "var(--shadow-sm)" }} />
                  ) : (
                    <div style={{ width: "80px", height: "80px", borderRadius: "var(--br-md)", background: "var(--cl-surface)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--cl-border)" }}><Video size={32} color="var(--cl-text-muted)" /></div>
                  )}
                  <div>
                    <div style={{ fontSize: "var(--fs-sm)", fontWeight: "var(--fw-medium)", color: "var(--cl-text)" }}>{file.name}</div>
                    <div style={{ fontSize: "var(--fs-xs)", color: "var(--cl-text-muted)" }}>{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
                  </div>
                  <button type="button" className="btn btn-ghost btn-xs" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFile(null); setPreviewUrl(""); }} style={{ position: "relative", zIndex: 10, marginTop: "var(--sp-xs)" }}>Remove</button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--sp-sm)", pointerEvents: "none" }}>
                  <ImageIcon size={32} color="var(--cl-text-muted)" />
                  <div>
                    <div style={{ fontSize: "var(--fs-sm)", fontWeight: "var(--fw-medium)" }}>Click to browse</div>
                    <div style={{ fontSize: "var(--fs-xs)", color: "var(--cl-text-muted)" }}>Max 15MB, images or videos</div>
                  </div>
                </div>
              )}
            </div>

            <div className="input-wrap">
              <label className="input-label">Caption (Optional)</label>
              <textarea className="input" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Where was this taken?" rows={2} style={{ resize: "none" }} />
            </div>

            {file && file.size > 15 * 1024 * 1024 && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--sp-xs)", color: "var(--cl-error)", fontSize: "var(--fs-xs)", background: "rgba(230,57,70,0.1)", padding: "var(--sp-sm)", borderRadius: "var(--br-md)" }}>
                <AlertCircle size={14} style={{ flexShrink: 0, marginTop: "2px" }} />
                <span>File is too large. Maximum size is 15MB.</span>
              </div>
            )}

            <button className="btn btn-primary" style={{ width: "100%", marginTop: "var(--sp-xs)" }} disabled={createMutation.isPending || !file || file.size > 15 * 1024 * 1024}>
              {createMutation.isPending ? "Uploading..." : "Upload to Gallery"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
