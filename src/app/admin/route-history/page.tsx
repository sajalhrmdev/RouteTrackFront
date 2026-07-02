'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { CalendarDays, Search, Route, Navigation, Clock, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardLayout } from '@/components/dashboard-layout';
import { employeeService } from '@/services/employee.service';
import { gpsService } from '@/services/gps.service';
import { Employee, RouteHistory } from '@/types';
import { formatDuration, formatDistance, formatDate } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const RouteMap: any = dynamic(() => import('@/components/route-map').then((m) => m.RouteMap), {
  ssr: false,
  loading: () => <Skeleton className="h-[450px] w-full rounded-xl" />,
});

export default function RouteHistoryPage() {
  const today = new Date().toISOString().split('T')[0];
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedDate, setSelectedDate] = useState(today);

  const { data: employees } = useQuery({
    queryKey: ['employees-list'],
    queryFn: () => employeeService.getAll({ limit: '100' }),
  });

  const { data: routeHistory, isLoading: routeLoading } = useQuery({
    queryKey: ['route-history', selectedEmployee, selectedDate],
    queryFn: () => gpsService.getRouteHistory(selectedEmployee, selectedDate),
    enabled: !!selectedEmployee && !!selectedDate,
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Route History</h1>
          <p className="text-muted-foreground">Replay employee routes for any date</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2">
                <Label>Select Employee</Label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Choose employee..." />
                  </SelectTrigger>
                  <SelectContent>
                    {employees?.data?.map((emp: Employee) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name} ({emp.employeeId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Select Date</Label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-[200px]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {routeHistory && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card className="lg:col-span-3 overflow-hidden">
              <CardContent className="p-0 h-[450px]">
                <RouteMap route={routeHistory} />
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Route Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Route className="h-4 w-4" />
                      Distance
                    </div>
                    <span className="font-medium">{formatDistance(routeHistory.totalDistance)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Duration
                    </div>
                    <span className="font-medium">{formatDuration(routeHistory.totalTime)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      Points
                    </div>
                    <span className="font-medium">{routeHistory.locations.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Navigation className="h-4 w-4" />
                      Avg Speed
                    </div>
                    <span className="font-medium">
                      {routeHistory.totalTime > 0
                        ? `${((routeHistory.totalDistance / routeHistory.totalTime) * 3.6).toFixed(1)} km/h`
                        : '0 km/h'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
                  {routeHistory.startTime && (
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                      <span className="text-muted-foreground">Start:</span>
                      <span className="font-medium">{formatDate(routeHistory.startTime, 'time')}</span>
                    </div>
                  )}
                  {routeHistory.endTime && (
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                      <span className="text-muted-foreground">End:</span>
                      <span className="font-medium">{formatDate(routeHistory.endTime, 'time')}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {!routeHistory && selectedEmployee && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Route className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No route data for this date</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
