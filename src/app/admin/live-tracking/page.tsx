'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Map, Users, Clock, Route, Navigation } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardLayout } from '@/components/dashboard-layout';
import { liveLocationService } from '@/services/live-location.service';
import { useSocket } from '@/hooks/useSocket';
import { formatDuration, formatDistance } from '@/lib/utils';

const LiveMap: any = dynamic(() => import('@/components/live-map').then((m) => m.LiveMap), {
  ssr: false,
  loading: () => <Skeleton className="h-[500px] w-full rounded-xl" />,
});

export default function LiveTrackingPage() {
  useSocket();

  const { data: liveLocations, isLoading } = useQuery({
    queryKey: ['live-locations'],
    queryFn: () => liveLocationService.getActiveLocations(),
    refetchInterval: 10000,
  });

  const employees = useMemo(() => {
    if (!liveLocations) return [];
    return liveLocations.map((loc) => ({
      id: loc.attendanceId,
      employeeId: loc.employee.employeeId,
      employeeName: loc.employee.name,
      department: loc.employee.department?.name,
      designation: loc.employee.designation?.name,
      isOnline: loc.employee.isOnline,
      lastLocation: {
        latitude: loc.latitude,
        longitude: loc.longitude,
        speed: loc.speed,
        heading: loc.heading,
        timestamp: loc.timestamp,
      },
      totalDistance: loc.attendance.totalDistance,
      totalWorkingTime: loc.attendance.totalWorkingTime,
      checkInTime: loc.attendance.checkInTime,
    }));
  }, [liveLocations]);

  const avgSpeed = useMemo(() => {
    if (!liveLocations || liveLocations.length === 0) return 0;
    const speeds = liveLocations.filter((l) => l.speed != null).map((l) => l.speed!);
    return speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0;
  }, [liveLocations]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Live Tracking</h1>
            <p className="text-muted-foreground">Real-time locations of all active employees</p>
          </div>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {liveLocations?.length || 0} Active
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{liveLocations?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Active Employees</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Navigation className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{(avgSpeed * 3.6).toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Avg Speed (km/h)</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Route className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">
                  {liveLocations?.length || 0}
                </p>
                <p className="text-xs text-muted-foreground">Active Routes</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Map className="h-5 w-5" />
              Live Map
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-[500px]">
            {isLoading ? (
              <Skeleton className="h-full w-full rounded-none" />
            ) : (
              <LiveMap employees={employees} />
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((emp, idx) => (
            <motion.div
              key={emp.employeeId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary shrink-0">
                      {emp.employeeName?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'NA'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{emp.employeeName}</p>
                        <div className={`w-2 h-2 rounded-full shrink-0 ${emp.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                      </div>
                      <p className="text-xs text-muted-foreground">{emp.department || 'N/A'}</p>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                        {emp.totalDistance > 0 && (
                          <span className="flex items-center gap-1">
                            <Route className="h-3 w-3" />
                            {formatDistance(emp.totalDistance)}
                          </span>
                        )}
                        {emp.totalWorkingTime > 0 && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDuration(emp.totalWorkingTime)}
                          </span>
                        )}
                        {emp.lastLocation?.speed != null && (
                          <span className="flex items-center gap-1">
                            <Navigation className="h-3 w-3" />
                            {(emp.lastLocation.speed * 3.6).toFixed(1)} km/h
                          </span>
                        )}
                      </div>
                      {emp.lastLocation?.timestamp && (
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {new Date(emp.lastLocation.timestamp).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {!isLoading && employees.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Map className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No active employees</p>
              <p className="text-sm mt-1">Waiting for employees to check in...</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
