'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { useTheme } from 'next-themes';
import { RouteHistory } from '@/types';
import { formatDate } from '@/lib/utils';

const MOVING_MARKER_ICON = L.divIcon({
  className: 'bg-transparent',
  html: `<div class="w-6 h-6 rounded-full bg-primary shadow-lg border-3 border-background flex items-center justify-center z-50">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
  </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

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
  html: `<div class="w-3 h-3 rounded-full bg-blue-500 border border-background opacity-70"></div>`,
  iconSize: [8, 8],
  iconAnchor: [4, 4],
});

export function RouteAnimation({ route }: { route: RouteHistory }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const movingMarkerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const pointMarkersRef = useRef<L.Marker[]>([]);
  const startMarkerRef = useRef<L.Marker | null>(null);
  const endMarkerRef = useRef<L.Marker | null>(null);
  const trailRef = useRef<L.Polyline | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const animTimeoutRef = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [speed, setSpeed] = useState(1);
  const progressRef = useRef(0);

  const positions: [number, number][] = useMemo(
    () => route.locations.map((loc) => [loc.latitude, loc.longitude]),
    [route.locations]
  );

  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const attribution = isDark
    ? '&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a>'
    : '&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors';

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
    trailRef.current?.remove();
    movingMarkerRef.current?.remove();
    pointMarkersRef.current.forEach((m) => m.remove());
    pointMarkersRef.current = [];

    polylineRef.current = L.polyline(positions, {
      color: '#3b82f6',
      weight: 3,
      opacity: 0.4,
    }).addTo(map);

    startMarkerRef.current = L.marker(positions[0], { icon: START_ICON }).addTo(map);
    endMarkerRef.current = L.marker(positions[positions.length - 1], { icon: END_ICON }).addTo(map);

    if (positions.length > 1) {
      positions.slice(1, -1).forEach((pos) => {
        const m = L.marker(pos, { icon: POINT_ICON }).addTo(map);
        pointMarkersRef.current.push(m);
      });
    }

    movingMarkerRef.current = L.marker(positions[0], { icon: MOVING_MARKER_ICON }).addTo(map);

    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions.map((p) => L.latLng(p[0], p[1])));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    }

    setCurrentIdx(0);
    progressRef.current = 0;

    return () => {
      if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
    };
  }, [positions]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || positions.length === 0) return;

    if (!playing) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
      if (movingMarkerRef.current) {
        movingMarkerRef.current.setLatLng(positions[currentIdx] || positions[0]);
      }
      return;
    }

    const animate = () => {
      const idx = progressRef.current;
      if (idx >= positions.length - 1) {
        setPlaying(false);
        return;
      }

      const nextIdx = idx + 1;
      if (movingMarkerRef.current) {
        movingMarkerRef.current.setLatLng(positions[nextIdx]);
      }

      if (trailRef.current) {
        trailRef.current.setLatLngs(positions.slice(0, nextIdx + 1));
      } else {
        trailRef.current = L.polyline(positions.slice(0, nextIdx + 1), {
          color: '#3b82f6',
          weight: 4,
          opacity: 1,
        }).addTo(map);
      }

      map.panTo(positions[nextIdx], { animate: true, duration: 0.3 });
      setCurrentIdx(nextIdx);
      progressRef.current = nextIdx;

      const interval = Math.max(50, 200 / speed);
      animTimeoutRef.current = window.setTimeout(animate, interval);
    };

    animTimeoutRef.current = window.setTimeout(animate, 0);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
    };
  }, [playing, speed, positions]);

  const totalPoints = positions.length;
  const progress = totalPoints > 1 ? Math.round((currentIdx / (totalPoints - 1)) * 100) : 0;

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full rounded-lg" style={{ zIndex: 0 }} />
      <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 border shadow-lg" style={{ zIndex: 1000 }}>
        <button
          onClick={() => setPlaying(!playing)}
          className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 hover:bg-primary/90"
        >
          {playing ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
          )}
        </button>
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-xs text-muted-foreground shrink-0 w-20 text-right">
          {currentIdx}/{totalPoints}
        </span>
        <select
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="text-xs bg-transparent border border-border rounded px-1 py-0.5"
        >
          <option value={0.5}>0.5x</option>
          <option value={1}>1x</option>
          <option value={2}>2x</option>
          <option value={5}>5x</option>
          <option value={10}>10x</option>
        </select>
      </div>
    </div>
  );
}
