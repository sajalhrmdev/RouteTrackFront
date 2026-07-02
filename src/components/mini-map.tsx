'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useTheme } from 'next-themes';

const CURRENT_POSITION_ICON = L.divIcon({
  className: 'bg-transparent',
  html: `<div class="w-4 h-4 rounded-full bg-primary shadow-lg border-2 border-background"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export function MiniMap({
  points,
  currentPosition,
}: {
  points: [number, number][];
  currentPosition?: [number, number];
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const positionMarkerRef = useRef<L.Marker | null>(null);

  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const attribution = isDark
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  const center = currentPosition || [40.7128, -74.006] as [number, number];

  useEffect(() => {
    if (containerRef.current && !mapRef.current) {
      mapRef.current = L.map(containerRef.current, {
        center,
        zoom: 15,
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
      });
      tileLayerRef.current = L.tileLayer(tileUrl, { attribution }).addTo(mapRef.current);
      setTimeout(() => mapRef.current?.invalidateSize(), 200);
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        tileLayerRef.current = null;
        polylineRef.current = null;
        positionMarkerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapRef.current && tileLayerRef.current) {
      tileLayerRef.current.setUrl(tileUrl);
    }
  }, [tileUrl]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (positionMarkerRef.current) {
      positionMarkerRef.current.remove();
      positionMarkerRef.current = null;
    }

    if (currentPosition) {
      positionMarkerRef.current = L.marker(currentPosition, { icon: CURRENT_POSITION_ICON }).addTo(map);
    }

    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    if (points.length > 1) {
      polylineRef.current = L.polyline(points, {
        color: '#3b82f6',
        weight: 3,
        opacity: 0.7,
      }).addTo(map);

      if (points.length > 0) {
        const bounds = L.latLngBounds(points.map((p) => L.latLng(p[0], p[1])));
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [30, 30], maxZoom: 16 });
        }
      }
    }
  }, [points, currentPosition]);

  return <div ref={containerRef} className="h-full w-full rounded-lg" />;
}
