'use client';

import { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import { useTheme } from 'next-themes';
import { RouteHistory } from '@/types';
import { formatDate } from '@/lib/utils';

const START_ICON = L.divIcon({
  className: 'bg-transparent',
  html: `<div class="w-8 h-8 rounded-full bg-green-500 shadow-lg border-2 border-background flex items-center justify-center text-white text-xs font-bold">S</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const END_ICON = L.divIcon({
  className: 'bg-transparent',
  html: `<div class="w-8 h-8 rounded-full bg-red-500 shadow-lg border-2 border-background flex items-center justify-center text-white text-xs font-bold">E</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const STOP_ICON = L.divIcon({
  className: 'bg-transparent',
  html: `<div class="w-4 h-4 rounded-full bg-yellow-500 shadow-lg border-2 border-background"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export function RouteMap({ route }: { route: RouteHistory }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const attribution = isDark
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  const positions: [number, number][] = useMemo(
    () => route.locations.map((loc) => [loc.latitude, loc.longitude]),
    [route.locations]
  );

  const center: [number, number] = route.startLocation
    ? [route.startLocation.lat, route.startLocation.lng]
    : [40.7128, -74.006];

  useEffect(() => {
    if (containerRef.current && !mapRef.current) {
      mapRef.current = L.map(containerRef.current, {
        center,
        zoom: 14,
        zoomControl: false,
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
        markersRef.current = [];
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
    if (!map || positions.length === 0) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (polylineRef.current) {
      polylineRef.current.remove();
    }

    polylineRef.current = L.polyline(positions, {
      color: '#3b82f6',
      weight: 4,
      opacity: 0.8,
    }).addTo(map);

    const startMarker = L.marker(positions[0], { icon: START_ICON })
      .bindPopup(`Start: ${route.startTime ? formatDate(route.startTime, 'long') : 'N/A'}`)
      .addTo(map);
    markersRef.current.push(startMarker);

    const endMarker = L.marker(positions[positions.length - 1], { icon: END_ICON })
      .bindPopup(`End: ${route.endTime ? formatDate(route.endTime, 'long') : 'N/A'}`)
      .addTo(map);
    markersRef.current.push(endMarker);

    positions.slice(1, -1).forEach((pos, idx) => {
      const stopMarker = L.marker(pos, { icon: STOP_ICON })
        .bindPopup(`
          <div style="font-size:12px">
            <p style="margin:0 0 4px">Stop ${idx + 1}</p>
            <p style="margin:0;color:#666">
              ${route.locations[idx + 1]?.timestamp ? formatDate(route.locations[idx + 1].timestamp, 'time') : ''}
            </p>
          </div>
        `)
        .addTo(map);
      markersRef.current.push(stopMarker);
    });

    const bounds = L.latLngBounds(positions.map((p) => L.latLng(p[0], p[1])));
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [positions, route.startTime, route.endTime, route.locations]);

  return <div ref={containerRef} className="h-full w-full rounded-lg" />;
}
