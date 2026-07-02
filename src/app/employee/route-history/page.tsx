'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { CalendarDays, Route, Navigation, Clock, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardLayout } from '@/components/dashboard-layout';
import { gpsService } from '@/services/gps.service';
import { formatDuration, formatDistance } from '@/lib/utils';

const RouteAnimation: any = dynamic(() => import('@/components/route-animation').then((m) => m.RouteAnimation), {
  ssr: false,
  loading: () => <Skeleton className="h-[450px] w-full rounded-xl" />,
});

export default function EmployeeRouteHistoryPage() {
  const searchParams = useSearchParams();
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(searchParams.get('date') || today);

  const { data: routeHistory, isLoading } = useQuery({
    queryKey: ['my-route-history', selectedDate],
    queryFn: () => gpsService.getRouteHistory('me', selectedDate),
    enabled: !!selectedDate,
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Routes</h1>
          <p className="text-muted-foreground">Replay your tracked routes for any date</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 items-end">
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

        {isLoading && (
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-[450px] w-full rounded-xl" />
            </CardContent>
          </Card>
        )}

        {routeHistory && routeHistory.locations.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card className="lg:col-span-3 overflow-hidden">
              <CardContent className="p-0 h-[500px]">
                <RouteAnimation route={routeHistory} />
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
                      GPS Points
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
                      <span className="font-medium">{new Date(routeHistory.startTime).toLocaleTimeString()}</span>
                    </div>
                  )}
                  {routeHistory.endTime && (
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                      <span className="text-muted-foreground">End:</span>
                      <span className="font-medium">{new Date(routeHistory.endTime).toLocaleTimeString()}</span>
                    </div>
                  )}
                  {routeHistory.startTime && routeHistory.endTime && (
                    <div className="flex items-center gap-2 text-xs pt-2 border-t">
                      <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                      <span className="text-muted-foreground">Coverage:</span>
                      <span className="font-medium">
                        {((routeHistory.totalTime / (
                          (new Date(routeHistory.endTime).getTime() - new Date(routeHistory.startTime).getTime()) / 1000
                        )) * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {routeHistory && routeHistory.locations.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Route className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No route data for this date</p>
              <p className="text-sm mt-1">Check in and start tracking to record your route</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
