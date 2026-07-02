'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  speed: number | null;
  heading: number | null;
  error: string | null;
  loading: boolean;
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watchMode?: boolean;
  trackingInterval?: number;
  minDistance?: number;
}

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 0,
    watchMode = false,
    trackingInterval = 10000,
    minDistance = 20,
  } = options;

  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    speed: null,
    heading: null,
    error: null,
    loading: true,
  });

  const lastPositionRef = useRef<{ lat: number; lng: number } | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handlePosition = useCallback((position: GeolocationPosition) => {
    const { latitude, longitude, accuracy, speed, heading } = position.coords;

    setState({
      latitude,
      longitude,
      accuracy,
      speed,
      heading,
      error: null,
      loading: false,
    });

    lastPositionRef.current = { lat: latitude, lng: longitude };
  }, []);

  const handleError = useCallback((error: GeolocationPositionError) => {
    setState((prev) => ({
      ...prev,
      error: error.message,
      loading: false,
    }));
  }, []);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({ ...prev, error: 'Geolocation not supported', loading: false }));
      return;
    }

    if (watchMode) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy, speed, heading } = position.coords;

          if (lastPositionRef.current) {
            const distance = calculateDistance(
              lastPositionRef.current.lat,
              lastPositionRef.current.lng,
              latitude,
              longitude
            );
            if (distance < minDistance) return;
          }

          handlePosition(position);
        },
        handleError,
        { enableHighAccuracy, timeout, maximumAge }
      );
    } else {
      navigator.geolocation.getCurrentPosition(handlePosition, handleError, {
        enableHighAccuracy,
        timeout,
        maximumAge,
      });

      if (trackingInterval > 0) {
        intervalRef.current = setInterval(() => {
          navigator.geolocation.getCurrentPosition(handlePosition, handleError, {
            enableHighAccuracy,
            timeout,
            maximumAge,
          });
        }, trackingInterval);
      }
    }

    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [watchMode, enableHighAccuracy, timeout, maximumAge, trackingInterval, minDistance, handlePosition, handleError]);

  return state;
}
