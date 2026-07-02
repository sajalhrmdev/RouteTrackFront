'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
  Clock,
  MapPin,
  Route,
  TrendingUp,
  Play,
  Square,
  Battery,
  Navigation,
  Wifi,
  WifiOff,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardLayout } from '@/components/dashboard-layout';
import { attendanceService } from '@/services/attendance.service';
import { gpsService } from '@/services/gps.service';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useSocket } from '@/hooks/useSocket';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { formatDuration, formatDistance, formatDate } from '@/lib/utils';

const MiniMap: any = dynamic(() => import('@/components/mini-map').then((m) => m.MiniMap), {
  ssr: false,
  loading: () => <Skeleton className="h-[200px] w-full rounded-xl" />,
});

export default function EmployeeDashboardPage() {
  const queryClient = useQueryClient();
  const { emitLocation } = useSocket();
  const isOnline = useOnlineStatus();
  const { addPendingLocation, pendingCount } = useOfflineSync();
  const [isTracking, setIsTracking] = useState(false);
  const [workingTime, setWorkingTime] = useState(0);
  const [currentPos, setCurrentPos] = useState<{ lat: number; lng: number } | null>(null);
  const [routePoints, setRoutePoints] = useState<[number, number][]>([]);
  const attendanceIdRef = useRef<string | null>(null);
  const restBatchRef = useRef<[number, number][]>([]);

  const geo = useGeolocation({
    enableHighAccuracy: true,
    trackingInterval: isTracking ? 10000 : 0,
    minDistance: 20,
  });

  const { data: todayAttendance, isLoading } = useQuery({
    queryKey: ['employee-today'],
    queryFn: () => attendanceService.getEmployeeToday('me'),
    refetchInterval: 30000,
  });

  const isCheckedIn = todayAttendance?.status === 'CHECKED_IN';

  useEffect(() => {
    if (isCheckedIn) {
      setIsTracking(true);
      if (todayAttendance?.id) attendanceIdRef.current = todayAttendance.id;
      if (todayAttendance?.checkInTime) {
        const elapsed = Math.floor(
          (Date.now() - new Date(todayAttendance.checkInTime).getTime()) / 1000
        );
        setWorkingTime(elapsed + (todayAttendance.totalWorkingTime || 0));
      }
    }
  }, [isCheckedIn, todayAttendance]);

  useEffect(() => {
    if (!isTracking) return;
    const interval = setInterval(() => {
      setWorkingTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTracking]);

  useEffect(() => {
    const lat = geo.latitude;
    const lng = geo.longitude;
    if (lat !== null && lng !== null && isTracking) {
      emitLocation({
        latitude: lat,
        longitude: lng,
        accuracy: geo.accuracy || undefined,
        speed: geo.speed || undefined,
        heading: geo.heading || undefined,
      });

      if (!isOnline) {
        addPendingLocation({
          latitude: lat,
          longitude: lng,
          accuracy: geo.accuracy || undefined,
          speed: geo.speed || undefined,
          heading: geo.heading || undefined,
          timestamp: new Date().toISOString(),
        });
      }

      setRoutePoints((prev) => {
        const last = prev[prev.length - 1];
        if (last) {
          const R = 6371000;
          const dLat = (lat - last[0]) * Math.PI / 180;
          const dLon = (lng - last[1]) * Math.PI / 180;
          const a = Math.sin(dLat / 2) ** 2 + Math.cos(last[0] * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
          const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          if (dist < 20) return prev;
        }
        return [...prev, [lat, lng] as [number, number]];
      });

      restBatchRef.current.push([lat, lng]);
    }
  }, [geo.latitude, geo.longitude, isTracking, emitLocation, isOnline, addPendingLocation]);

  useEffect(() => {
    if (!isTracking || restBatchRef.current.length === 0) return;
    const interval = setInterval(async () => {
      const batch = restBatchRef.current.splice(0);
      if (batch.length === 0 || !attendanceIdRef.current) return;
      try {
        await gpsService.recordBatch(
          batch.map(([lat, lng]) => ({ latitude: lat, longitude: lng })),
          attendanceIdRef.current
        );
      } catch {
        // REST backup failed, points will be in next interval
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [isTracking]);

  const checkInMutation = useMutation({
    mutationFn: async () => {
      if (!geo.latitude || !geo.longitude) throw new Error('Location not available');
      return attendanceService.checkIn(geo.latitude!, geo.longitude!);
    },
    onSuccess: (data) => {
      setIsTracking(true);
      setWorkingTime(0);
      setRoutePoints([]);
      restBatchRef.current = [];
      if (data?.id) attendanceIdRef.current = data.id;
      queryClient.invalidateQueries({ queryKey: ['employee-today'] });
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: async () => {
      if (!geo.latitude || !geo.longitude) throw new Error('Location not available');
      return attendanceService.checkOut(geo.latitude, geo.longitude);
    },
    onSuccess: () => {
      setIsTracking(false);
      attendanceIdRef.current = null;
      restBatchRef.current = [];
      queryClient.invalidateQueries({ queryKey: ['employee-today'] });
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Employee Dashboard</h1>
            <p className="text-muted-foreground">Track your work time and location</p>
          </div>
          <div className="flex items-center gap-2">
            {!isOnline && (
              <Badge variant="warning" className="flex items-center gap-1">
                <WifiOff className="h-3 w-3" /> Offline
              </Badge>
            )}
            {pendingCount > 0 && (
              <Badge variant="warning" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> {pendingCount} pending
              </Badge>
            )}
            <Badge variant={geo.loading ? 'secondary' : 'success'} className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {geo.loading ? 'Locating...' : geo.error ? 'No GPS' : 'GPS Active'}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Working Time</p>
                  <p className="text-3xl font-bold mt-1">{formatDuration(workingTime)}</p>
                </div>
                <Clock className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Distance Today</p>
                  <p className="text-3xl font-bold mt-1">
                    {formatDistance(todayAttendance?.totalDistance || 0)}
                  </p>
                </div>
                <Route className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Speed</p>
                  <p className="text-3xl font-bold mt-1">
                    {geo.speed ? `${(geo.speed * 3.6).toFixed(1)} km/h` : '0 km/h'}
                  </p>
                </div>
                <Navigation className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Today's Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[200px]" />
              ) : (
                <div className="space-y-4">
                  {todayAttendance ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <span className="text-sm text-muted-foreground">Check In</span>
                        <span className="font-medium">{formatDate(todayAttendance.checkInTime, 'long')}</span>
                      </div>
                      {todayAttendance.checkOutTime && (
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <span className="text-sm text-muted-foreground">Check Out</span>
                          <span className="font-medium">{formatDate(todayAttendance.checkOutTime, 'long')}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <Badge variant={isCheckedIn ? 'success' : 'secondary'}>
                          {isCheckedIn ? 'Active' : 'Completed'}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="h-10 w-10 mx-auto mb-3 opacity-50" />
                      <p>No attendance record for today</p>
                      <p className="text-sm">Check in to start tracking</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    {!isCheckedIn ? (
                      <Button
                        className="flex-1"
                        size="lg"
                        onClick={() => checkInMutation.mutate()}
                        disabled={checkInMutation.isPending || !geo.latitude || !isOnline}
                      >
                        {checkInMutation.isPending ? (
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                        ) : (
                          <Play className="h-5 w-5 mr-2" />
                        )}
                        Check In
                      </Button>
                    ) : (
                      <Button
                        className="flex-1"
                        size="lg"
                        variant="destructive"
                        onClick={() => checkOutMutation.mutate()}
                        disabled={checkOutMutation.isPending || !isOnline}
                      >
                        {checkOutMutation.isPending ? (
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                        ) : (
                          <Square className="h-5 w-5 mr-2" />
                        )}
                        Check Out
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Route Preview</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <MiniMap
                points={routePoints}
                currentPosition={
                  geo.latitude && geo.longitude
                    ? [geo.latitude, geo.longitude]
                    : undefined
                }
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
