import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { useDestinationImage } from "@/hooks/useDestinationImage";

export function CityImageThumb({ city, title, className = "" }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const { data, isLoading, isError } = useDestinationImage(city);
  const showImage = data?.imageUrl && !failed && !isError;

  return (
    <div className={`city-image-thumb ${loaded ? "city-image-thumb-loaded" : ""} ${className}`}>
      {!loaded && !failed && city !== "default" && <div className="city-image-thumb-skeleton" aria-hidden="true" />}
      {showImage ? (
        <img
          src={data.imageUrl}
          srcSet={data.smallImageUrl ? `${data.smallImageUrl} 640w, ${data.imageUrl} 1080w` : undefined}
          sizes="(max-width: 768px) 100vw, 18rem"
          alt={title}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      ) : (
        !isLoading && (
          <div className="city-image-thumb-fallback" aria-hidden="true">
            <ImageIcon size={24} />
          </div>
        )
      )}
    </div>
  );
}

export function UnsplashCredit({ image }) {
  if (image?.source !== "unsplash" || !image.photographerName || !image.photographerUrl) return null;

  return (
    <a className="unsplash-credit" href={image.photographerUrl} target="_blank" rel="noreferrer">
      Photo: {image.photographerName}
    </a>
  );
}
