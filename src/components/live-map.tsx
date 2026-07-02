'use client';

import { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import { useTheme } from 'next-themes';

const EMPLOYEE_ICON = L.divIcon({
  className: 'bg-transparent',
  html: `<div class="w-6 h-6 rounded-full bg-primary shadow-lg border-2 border-background flex items-center justify-center">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
  </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

const MOVING_ICON = L.divIcon({
  className: 'bg-transparent',
  html: `<div class="w-6 h-6 rounded-full bg-green-500 shadow-lg border-2 border-background flex items-center justify-center animate-pulse">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
  </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

export function LiveMap({ employees }: { employees: any[] }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const attribution = isDark
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  const center: [number, number] = useMemo(() => {
    if (employees.length > 0 && employees[0]?.lastLocation) {
      return [employees[0].lastLocation.latitude, employees[0].lastLocation.longitude];
    }
    return [40.7128, -74.006];
  }, [employees]);

  useEffect(() => {
    if (containerRef.current && !mapRef.current) {
      mapRef.current = L.map(containerRef.current, {
        center,
        zoom: 12,
        zoomControl: false,
      });
      tileLayerRef.current = L.tileLayer(tileUrl, { attribution }).addTo(mapRef.current);
      setTimeout(() => mapRef.current?.invalidateSize(), 200);
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current.clear();
        tileLayerRef.current = null;
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

    const employeeIds = new Set(employees.map((e) => e.employeeId));

    markersRef.current.forEach((marker, id) => {
      if (!employeeIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    employees.forEach((emp) => {
      if (!emp.lastLocation?.latitude || !emp.lastLocation?.longitude) return;

      const pos: [number, number] = [emp.lastLocation.latitude, emp.lastLocation.longitude];
      const hasSpeed = emp.lastLocation.speed != null && emp.lastLocation.speed > 0.5;
      const icon = hasSpeed ? MOVING_ICON : EMPLOYEE_ICON;

      let marker = markersRef.current.get(emp.employeeId);
      if (marker) {
        marker.setLatLng(pos);
        marker.setIcon(icon);
      } else {
        marker = L.marker(pos, { icon }).addTo(map);
        markersRef.current.set(emp.employeeId, marker);
      }

      const initials = (emp.employeeName?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)) || 'NA';
      const speedKmh = emp.lastLocation.speed != null ? (emp.lastLocation.speed * 3.6).toFixed(1) : null;
      const timeStr = emp.lastLocation.timestamp ? new Date(emp.lastLocation.timestamp).toLocaleTimeString() : '';

      marker.bindPopup(`
        <div style="min-width:200px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;background:var(--primary-bg, rgba(59,130,246,0.1));color:var(--primary-text, #3b82f6);font-size:12px;font-weight:600">${initials}</div>
            <div>
              <p style="font-weight:500;font-size:14px;margin:0">${emp.employeeName || ''}</p>
              <p style="font-size:12px;color:var(--muted-text, #666);margin:0">${emp.department || 'N/A'}</p>
            </div>
          </div>
          <div style="font-size:12px;line-height:1.6">
            ${speedKmh != null ? `<div style="display:flex;align-items:center;gap:8px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10"/></svg><span>${speedKmh} km/h</span></div>` : ''}
            <div style="display:flex;align-items:center;gap:8px"><span style="width:8px;height:8px;border-radius:50%;background:${emp.isOnline ? '#22c55e' : '#9ca3af'}"></span><span>${emp.isOnline ? 'Online' : 'Offline'}</span></div>
            ${timeStr ? `<p style="color:var(--muted-text, #999);margin:4px 0 0;font-size:11px">${timeStr}</p>` : ''}
          </div>
        </div>
      `, { className: 'custom-popup' });
    });

    const validCoords = employees
      .filter((e) => e.lastLocation?.latitude && e.lastLocation?.longitude)
      .map((e) => [e.lastLocation.latitude, e.lastLocation.longitude] as [number, number]);

    if (validCoords.length > 0) {
      const bounds = L.latLngBounds(validCoords.map((c) => L.latLng(c[0], c[1])));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      }
    }
  }, [employees]);

  return <div ref={containerRef} className="h-full w-full rounded-lg" />;
}
