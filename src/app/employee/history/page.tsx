'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Clock, CalendarDays, Route as RouteIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { DashboardLayout } from '@/components/dashboard-layout';
import { attendanceService } from '@/services/attendance.service';
import { Attendance } from '@/types';
import { formatDuration, formatDistance, formatDate } from '@/lib/utils';

export default function EmployeeHistoryPage() {
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ['my-attendance-history'],
    queryFn: () => attendanceService.getHistory({ limit: '20', sortBy: 'checkInTime', sortOrder: 'desc' }),
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Attendance History</h1>
          <p className="text-muted-foreground">View your past attendance records</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Attendance Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Distance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[80px]">Route</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data?.map((record: Attendance) => (
                    <TableRow key={record.id}>
                      <TableCell className="text-sm">
                        {formatDate(record.checkInTime, 'short')}
                      </TableCell>
                      <TableCell className="text-sm">
                        {record.checkInTime ? formatDate(record.checkInTime, 'time') : '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {record.checkOutTime ? formatDate(record.checkOutTime, 'time') : '-'}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {record.totalWorkingTime > 0 ? formatDuration(record.totalWorkingTime) : '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {record.totalDistance > 0 ? formatDistance(record.totalDistance) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={record.status === 'CHECKED_IN' ? 'success' : 'secondary'}>
                          {record.status === 'CHECKED_IN' ? 'Active' : 'Completed'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            const date = record.checkInTime.split('T')[0];
                            router.push(`/employee/route-history?date=${date}`);
                          }}
                          title="View Route"
                        >
                          <RouteIcon className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!data?.data || data.data.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        No attendance records found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
