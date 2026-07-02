'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth';
import { useAppStore } from '@/store/app';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const accessToken = useAuthStore((s) => s.accessToken);
  const updateEmployeeLocation = useAppStore((s) => s.updateEmployeeLocation);
  const addNotification = useAppStore((s) => s.addNotification);
  const setCheckedInEmployees = useAppStore((s) => s.setCheckedInEmployees);

  useEffect(() => {
    if (!accessToken) return;

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('locationUpdate', (data) => {
      updateEmployeeLocation(data.employeeId, {
        latitude: data.latitude,
        longitude: data.longitude,
        speed: data.speed,
        heading: data.heading,
        timestamp: data.timestamp,
      });
    });

    socket.on('notification', (data) => {
      addNotification(data);
    });

    socket.on('employeeStatus', (data) => {
      setCheckedInEmployees((prev) =>
        prev.map((emp) =>
          emp.employeeId === data.employeeId
            ? { ...emp, isOnline: data.isOnline }
            : emp
        )
      );
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken, updateEmployeeLocation, addNotification, setCheckedInEmployees]);

  const emitLocation = useCallback((data: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    speed?: number;
    heading?: number;
  }) => {
    socketRef.current?.emit('locationUpdate', data);
  }, []);

  return { socket: socketRef.current, emitLocation };
}
