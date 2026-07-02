import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(2)} km`;
}

export function formatDate(date: string | Date, format: 'short' | 'long' | 'time' = 'short'): string {
  const d = new Date(date);
  if (format === 'time') {
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
  if (format === 'long') {
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'CHECKED_IN': return 'text-green-500';
    case 'CHECKED_OUT': return 'text-gray-500';
    case 'ACTIVE': return 'text-green-500';
    case 'INACTIVE': return 'text-yellow-500';
    case 'SUSPENDED': return 'text-red-500';
    default: return 'text-gray-500';
  }
}

export function getStatusBgColor(status: string): string {
  switch (status) {
    case 'CHECKED_IN': return 'bg-green-500/10 border-green-500/20';
    case 'CHECKED_OUT': return 'bg-gray-500/10 border-gray-500/20';
    case 'ACTIVE': return 'bg-green-500/10';
    case 'INACTIVE': return 'bg-yellow-500/10';
    case 'SUSPENDED': return 'bg-red-500/10';
    default: return 'bg-gray-500/10';
  }
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getBatteryColor(level: number): string {
  if (level > 60) return 'text-green-500';
  if (level > 20) return 'text-yellow-500';
  return 'text-red-500';
}

export function debounce<T extends (...args: any[]) => any>(fn: T, ms: number): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
}
