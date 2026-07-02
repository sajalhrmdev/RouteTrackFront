'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
  Users,
  UserCheck,
  Clock,
  Route,
  TrendingUp,
  MapPin,
  Navigation,
  Wifi,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardLayout } from '@/components/dashboard-layout';
import { dashboardService } from '@/services/dashboard.service';
import { liveLocationService } from '@/services/live-location.service';
import { useSocket } from '@/hooks/useSocket';
import { formatDistance, formatDuration } from '@/lib/utils';

const LiveMap: any = dynamic(() => import('@/components/live-map').then((m) => m.LiveMap), {
  ssr: false,
  loading: () => <Skeleton className="h-[500px] w-full rounded-xl" />,
});

function StatCard({ title, value, icon: Icon, description, trend }: {
  title: string; value: string | number; icon: any; description?: string; trend?: { value: number; positive: boolean };
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold">{value}</p>
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
              {trend && (
                <div className={`flex items-center gap-1 text-xs ${trend.positive ? 'text-green-500' : 'text-red-500'}`}>
                  <TrendingUp className={`h-3 w-3 ${!trend.positive && 'rotate-180'}`} />
                  {trend.value}% from last month
                </div>
              )}
            </div>
            <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Icon className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function AdminDashboardPage() {
  useSocket();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardService.getStats,
    refetchInterval: 30000,
  });

  const { data: liveLocations, isLoading: liveLoading } = useQuery({
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

  const statsCards = useMemo(() => [
    { title: 'Total Employees', value: stats?.totalEmployees || 0, icon: Users, description: 'Active employees' },
    { title: 'Online Now', value: stats?.employeesOnline || 0, icon: Wifi, description: 'Currently online' },
    { title: 'Checked In', value: employees.length, icon: UserCheck, description: 'Currently working' },
    { title: "Today's Attendance", value: stats?.todayAttendance || 0, icon: Clock, description: 'Total check-ins today' },
    { title: 'Avg Speed', value: `${(avgSpeed * 3.6).toFixed(1)} km/h`, icon: Navigation, description: 'Across active employees' },
    { title: 'Total Distance', value: stats?.totalDistance ? formatDistance(stats.totalDistance) : '0 m', icon: MapPin, description: 'Distance covered today' },
    { title: 'Active Routes', value: employees.length, icon: Route, description: 'Employees on the move' },
  ], [stats, employees.length, avgSpeed]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Real-time overview of your field operations</p>
          </div>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {employees.length} Active
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsLoading
            ? Array.from({ length: 7 }).map((_, i) => (
                <Card key={i}><CardContent className="p-6"><Skeleton className="h-24" /></CardContent></Card>
              ))
            : statsCards.map((card, i) => <StatCard key={i} {...card} />)}
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Live Map
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-[500px]">
            {liveLoading ? (
              <Skeleton className="h-full w-full rounded-none" />
            ) : (
              <LiveMap employees={employees} />
            )}
          </CardContent>
        </Card>

        <div>
          <h2 className="text-lg font-semibold mb-4">Active Employees</h2>
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
                        <p className="text-xs text-muted-foreground">{emp.department || 'N/A'} · {emp.designation || 'N/A'}</p>
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
            {!liveLoading && employees.length === 0 && (
              <div className="col-span-full">
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No active employees</p>
                    <p className="text-sm mt-1">Waiting for employees to check in...</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
