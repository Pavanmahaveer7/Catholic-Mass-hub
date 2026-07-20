"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Church } from "@/lib/masstimes";

type MapViewProps = {
  lat: number;
  lng: number;
  churches: Church[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  onRecenter?: (lat: number, lng: number) => void;
};

export function MapView({
  lat,
  lng,
  churches,
  selectedId,
  onSelect,
  onRecenter,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
          },
        },
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
          },
        ],
      },
      center: [lng, lat],
      zoom: 11,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.on("dblclick", (e) => {
      onRecenter?.(e.lngLat.lat, e.lngLat.lng);
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [lat, lng, onRecenter]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({ center: [lng, lat], zoom: map.getZoom() });
  }, [lat, lng]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    churches.forEach((church, index) => {
      const el = document.createElement("button");
      el.type = "button";
      el.className =
        "flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary text-xs font-bold text-primary-foreground shadow-md";
      el.textContent = String(index + 1);
      el.setAttribute("aria-label", church.name);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([parseFloat(church.longitude), parseFloat(church.latitude)])
        .addTo(map);

      el.addEventListener("click", () => onSelect?.(church.id));
      markersRef.current.push(marker);
    });
  }, [churches, onSelect]);

  useEffect(() => {
    if (!selectedId) return;
    const church = churches.find((c) => c.id === selectedId);
    const map = mapRef.current;
    if (!church || !map) return;
    map.flyTo({
      center: [parseFloat(church.longitude), parseFloat(church.latitude)],
      zoom: 13,
    });
  }, [selectedId, churches]);

  return (
    <div
      ref={containerRef}
      className="h-full min-h-[320px] w-full rounded-lg"
      role="application"
      aria-label="Map showing nearby parishes. Use the parish list for full accessibility."
    />
  );
}
