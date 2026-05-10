import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });

export function MapView({ stops = [], routeData, height = "400px" }) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const routeLayerRef = useRef(null);

  const markers = useMemo(() => {
    if (routeData?.markers?.length) return routeData.markers;
    return stops
      .filter((stop) => stop.city?.latitude && stop.city?.longitude)
      .map((stop) => ({
        stopId: stop.id,
        label: [stop.city.name, stop.city.country].filter(Boolean).join(", "),
        orderIndex: stop.orderIndex,
        coordinates: { latitude: Number(stop.city.latitude), longitude: Number(stop.city.longitude) },
      }));
  }, [routeData, stops]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    mapRef.current = L.map(containerRef.current).setView([20, 78], 4);
    L.tileLayer(routeData?.tileLayerUrl || "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: routeData?.attribution || "&copy; OpenStreetMap contributors",
    }).addTo(mapRef.current);
    routeLayerRef.current = L.layerGroup().addTo(mapRef.current);

    return () => {
      routeLayerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [routeData?.attribution, routeData?.tileLayerUrl]);

  useEffect(() => {
    const map = mapRef.current;
    const layer = routeLayerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();

    const markerPoints = markers
      .map((marker) => ({
        marker,
        coord: [Number(marker.coordinates?.latitude), Number(marker.coordinates?.longitude)],
      }))
      .filter(({ coord: [lat, lng] }) => Number.isFinite(lat) && Number.isFinite(lng));
    const coords = markerPoints.map(({ coord }) => coord);

    if (routeData?.routeGeoJson) {
      L.geoJSON(routeData.routeGeoJson, {
        style: { color: "#0D7680", weight: 3, dashArray: "6 4", className: "traveloop-route-line" },
      }).addTo(layer);
    } else if (coords.length > 1) {
      L.polyline(coords, { color: "#0D7680", weight: 3, dashArray: "6 4", className: "traveloop-route-line" }).addTo(layer);
    }

    markerPoints.forEach(({ marker, coord }, index) => {
      L.marker(coord).bindPopup(`<b>${marker?.label || `Stop ${index + 1}`}</b>`).addTo(layer);
    });

    if (coords.length > 1) map.fitBounds(coords, { padding: [24, 24] });
    else if (coords.length === 1) map.setView(coords[0], 8);
  }, [markers, routeData]);

  return (
    <div
      ref={containerRef}
      style={{ height, width: "100%" }}
      className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700"
      aria-label="Trip map"
    />
  );
}
