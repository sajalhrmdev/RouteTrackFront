'use client';

import { useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import { useTheme } from 'next-themes';

const CURRENT_POSITION_ICON = L.divIcon({
  className: 'bg-transparent',
  html: `<div class="w-5 h-5 rounded-full bg-primary shadow-lg border-3 border-background flex items-center justify-center">
    <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
  </div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
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
  const initialPosition = useRef<[number, number] | null>(null);

  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const attribution = isDark
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  useEffect(() => {
    if (containerRef.current && !mapRef.current) {
      const initial = currentPosition || [40.7128, -74.006] as [number, number];
      initialPosition.current = initial;
      mapRef.current = L.map(containerRef.current, {
        center: initial,
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
      map.panTo(currentPosition, { animate: true, duration: 0.3 });
    }

    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    if (points.length > 0) {
      if (points.length === 1) {
        const pos = currentPosition || points[0];
        map.setView(pos, 15);
      } else {
        polylineRef.current = L.polyline(points, {
          color: '#3b82f6',
          weight: 3,
          opacity: 0.7,
        }).addTo(map);

        const allPoints = currentPosition ? [...points, currentPosition] : points;
        const bounds = L.latLngBounds(allPoints.map((p) => L.latLng(p[0], p[1])));
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [30, 30], maxZoom: 16 });
        }
      }
    } else if (currentPosition) {
      map.setView(currentPosition, 15);
    }
  }, [points, currentPosition]);

  return <div ref={containerRef} className="h-full w-full rounded-lg" />;
}
