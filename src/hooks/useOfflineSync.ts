'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useOnlineStatus } from './useOnlineStatus';
import { gpsService } from '@/services/gps.service';

interface PendingLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  batteryLevel?: number;
  timestamp: string;
}

const STORAGE_KEY = 'pending_gps_locations';

export function useOfflineSync() {
  const isOnline = useOnlineStatus();
  const syncingRef = useRef(false);

  const savePendingLocations = useCallback((locations: PendingLocation[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(locations));
    } catch {
      console.error('Failed to save pending locations');
    }
  }, []);

  const getPendingLocations = useCallback((): PendingLocation[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  const addPendingLocation = useCallback((location: PendingLocation) => {
    const pending = getPendingLocations();
    pending.push(location);
    savePendingLocations(pending);
  }, [getPendingLocations, savePendingLocations]);

  const syncLocations = useCallback(async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;

    const pending = getPendingLocations();
    if (pending.length === 0) {
      syncingRef.current = false;
      return;
    }

    try {
      await gpsService.recordBatch(pending, '');
      savePendingLocations([]);
    } catch (error) {
      console.error('Sync failed, will retry later:', error);
    } finally {
      syncingRef.current = false;
    }
  }, [getPendingLocations, savePendingLocations]);

  useEffect(() => {
    if (isOnline) {
      syncLocations();
    }
  }, [isOnline, syncLocations]);

  return { addPendingLocation, getPendingLocations, syncLocations, pendingCount: getPendingLocations().length };
}
