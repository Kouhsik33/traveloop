import { clsx } from "clsx";
import "@/styles/components/skeleton.css";

/**
 * Premium skeleton loader with shimmer animation.
 * Usage: <Skeleton w="100%" h="200px" rounded="lg" />
 */
export function Skeleton({ w, h, rounded = "md", className, style, ...rest }) {
  return (
    <div
      className={clsx("skeleton", `skeleton-r-${rounded}`, className)}
      style={{ width: w, height: h, ...style }}
      aria-hidden="true"
      {...rest}
    />
  );
}

/** Card-shaped skeleton for trip/city cards */
export function SkeletonCard({ imageHeight = "12rem" }) {
  return (
    <div className="skeleton-card">
      <Skeleton w="100%" h={imageHeight} rounded="lg" />
      <div className="skeleton-card-body">
        <Skeleton w="70%" h="1.2rem" rounded="sm" />
        <Skeleton w="50%" h="0.9rem" rounded="sm" />
        <Skeleton w="90%" h="0.8rem" rounded="sm" />
      </div>
    </div>
  );
}

/** Row-shaped skeleton for list items */
export function SkeletonRow() {
  return (
    <div className="skeleton-row">
      <Skeleton w="3rem" h="3rem" rounded="full" />
      <div className="skeleton-row-body">
        <Skeleton w="60%" h="1rem" rounded="sm" />
        <Skeleton w="40%" h="0.8rem" rounded="sm" />
      </div>
    </div>
  );
}

/** Text block skeleton for paragraphs */
export function SkeletonText({ lines = 3 }) {
  return (
    <div className="skeleton-text">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          w={i === lines - 1 ? "60%" : "100%"}
          h="0.9rem"
          rounded="sm"
        />
      ))}
    </div>
  );
}
