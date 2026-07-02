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

const POINT_ICON = L.divIcon({
  className: 'bg-transparent',
  html: `<div class="w-[5px] h-[5px] rounded-full bg-emerald-500 opacity-60"></div>`,
  iconSize: [5, 5],
  iconAnchor: [2.5, 2.5],
});

const STOP_DOT_ICON = L.divIcon({
  className: 'bg-transparent',
  html: `<div class="w-3 h-3 rounded-full bg-orange-500 shadow-sm border border-orange-600"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

export function RouteAnimation({ route }: { route: RouteHistory }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const pointMarkersRef = useRef<L.Marker[]>([]);
  const stopMarkersRef = useRef<L.Marker[]>([]);
  const startMarkerRef = useRef<L.Marker | null>(null);
  const endMarkerRef = useRef<L.Marker | null>(null);

  const positions: [number, number][] = useMemo(
    () => route.locations.map((loc) => [loc.latitude, loc.longitude]),
    [route.locations]
  );

  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const attribution = isDark
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  useEffect(() => {
    if (containerRef.current && !mapRef.current) {
      mapRef.current = L.map(containerRef.current, {
        center: positions[0] || [40.7128, -74.006],
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

    startMarkerRef.current?.remove();
    endMarkerRef.current?.remove();
    polylineRef.current?.remove();
    pointMarkersRef.current.forEach((m) => m.remove());
    pointMarkersRef.current = [];
    stopMarkersRef.current.forEach((m) => m.remove());
    stopMarkersRef.current = [];

    polylineRef.current = L.polyline(positions, {
      color: '#ef4444',
      weight: 4,
      opacity: 0.5,
      dashArray: '8, 8',
    }).addTo(map);

    startMarkerRef.current = L.marker(positions[0], { icon: START_ICON }).addTo(map);
    endMarkerRef.current = L.marker(positions[positions.length - 1], { icon: END_ICON }).addTo(map);

    positions.slice(1, -1).forEach((pos) => {
      const m = L.marker(pos, { icon: POINT_ICON }).addTo(map);
      pointMarkersRef.current.push(m);
    });

    if (route.stops) {
      route.stops.forEach((stop) => {
        const pos: [number, number] = [stop.latitude, stop.longitude];
        const mins = Math.floor(stop.duration / 60);
        const m = L.marker(pos, { icon: STOP_DOT_ICON })
          .bindPopup(`
            <div style="font-size:12px;line-height:1.5">
              <p style="font-weight:600;margin:0 0 4px">Pause</p>
              <p style="margin:0">Arrived: ${formatDate(stop.arrivedAt, 'time')}</p>
              <p style="margin:0">Departed: ${formatDate(stop.departedAt, 'time')}</p>
              <p style="margin:0;color:#ea580c">Duration: ${mins}m ${stop.duration % 60}s</p>
            </div>
          `)
          .addTo(map);
        stopMarkersRef.current.push(m);
      });
    }

    const bounds = L.latLngBounds(positions.map((p) => L.latLng(p[0], p[1])));
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [positions, route.stops]);

  return (
    <div className="h-full w-full">
      <div ref={containerRef} className="h-full w-full rounded-lg" />
    </div>
  );
}
