import { useEffect, useState } from "react";

/** Tries primary URL first; swaps to fallback on failure (handles broken/expired CDN links). */
export function SmartImage({ src, fallbackSrc, alt, className, style, loading = "lazy" }) {
  const safeFallback = fallbackSrc || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80";
  const initial = src && String(src).startsWith("http") ? src : safeFallback;
  const [current, setCurrent] = useState(initial);

  useEffect(() => {
    setCurrent(src && String(src).startsWith("http") ? src : safeFallback);
  }, [src, safeFallback]);

  return (
    <img
      src={current}
      alt={alt || ""}
      loading={loading}
      className={className}
      style={style}
      onError={() => {
        if (current !== safeFallback) setCurrent(safeFallback);
      }}
    />
  );
}
