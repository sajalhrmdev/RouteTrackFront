'use client';

import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Route,
  TrendingUp,
  MapPin,
  Battery,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardLayout } from '@/components/dashboard-layout';
import { dashboardService } from '@/services/dashboard.service';
import { attendanceService } from '@/services/attendance.service';
import { useSocket } from '@/hooks/useSocket';
import { useAppStore } from '@/store/app';
import { formatDuration, formatDistance, formatDate } from '@/lib/utils';

const LiveMap: any = dynamic(() => import('@/components/live-map').then((m) => m.LiveMap), {
  ssr: false,
  loading: () => <Skeleton className="h-[400px] w-full rounded-xl" />,
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

function EmployeeCard({ employee }: { employee: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group"
    >
      <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                {employee.employeeName?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'NA'}
              </div>
              <div className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${employee.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{employee.employeeName || 'Unknown'}</p>
              <p className="text-xs text-muted-foreground truncate">{employee.department || 'N/A'} · {employee.designation || 'N/A'}</p>
              <div className="flex items-center gap-2 mt-1.5">
                {employee.lastLocation?.batteryLevel != null && (
                  <span className="flex items-center gap-1 text-xs">
                    <Battery className={`h-3 w-3 ${employee.lastLocation.batteryLevel > 60 ? 'text-green-500' : employee.lastLocation.batteryLevel > 20 ? 'text-yellow-500' : 'text-red-500'}`} />
                    {Math.round(employee.lastLocation.batteryLevel)}%
                  </span>
                )}
                {employee.lastLocation?.speed != null && (
                  <span className="text-xs text-muted-foreground">
                    {(employee.lastLocation.speed * 3.6).toFixed(1)} km/h
                  </span>
                )}
              </div>
              {employee.lastLocation?.timestamp && (
                <p className="text-xs text-muted-foreground mt-1">
                  Updated {formatDate(employee.lastLocation.timestamp, 'time')}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function AdminDashboardPage() {
  useSocket();

  const checkedInEmployees = useAppStore((s) => s.checkedInEmployees);
  const setCheckedInEmployees = useAppStore((s) => s.setCheckedInEmployees);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardService.getStats,
    refetchInterval: 30000,
  });

  const { data: checkedIn } = useQuery({
    queryKey: ['checked-in-employees'],
    queryFn: attendanceService.getCheckedIn,
    refetchInterval: 15000,
  });

  useEffect(() => {
    if (checkedIn) {
      setCheckedInEmployees(checkedIn);
    }
  }, [checkedIn, setCheckedInEmployees]);

  const statsCards = useMemo(() => [
    { title: 'Total Employees', value: stats?.totalEmployees || 0, icon: Users, description: 'Active employees' },
    { title: 'Online Now', value: stats?.employeesOnline || 0, icon: Wifi, description: 'Currently online', trend: { value: 12, positive: true } },
    { title: 'Checked In', value: checkedInEmployees.length, icon: UserCheck, description: 'Currently working' },
    { title: "Today's Attendance", value: stats?.todayAttendance || 0, icon: Clock, description: 'Total check-ins today' },
    { title: 'Active Routes', value: stats?.activeRoutes || 0, icon: Route, description: 'Employees on the move' },
    { title: 'Total Distance', value: stats?.totalDistance ? formatDistance(stats.totalDistance) : '0 m', icon: MapPin, description: 'Distance covered today' },
  ], [stats, checkedInEmployees.length]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Real-time overview of your field operations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}><CardContent className="p-6"><Skeleton className="h-24" /></CardContent></Card>
              ))
            : statsCards.map((card, i) => <StatCard key={i} {...card} />)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg">Live Tracking Map</CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-[400px]">
              <LiveMap employees={checkedInEmployees} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Checked In Employees</CardTitle>
                <Badge variant="secondary">{checkedInEmployees.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="max-h-[360px] overflow-y-auto space-y-2">
              {checkedInEmployees.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <UserCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No employees checked in</p>
                </div>
              ) : (
                checkedInEmployees.map((emp: any) => (
                  <EmployeeCard key={emp.id} employee={emp} />
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
