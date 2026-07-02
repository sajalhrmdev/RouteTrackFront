'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FileText, Download, CalendarDays, FileSpreadsheet, FileDown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardLayout } from '@/components/dashboard-layout';
import { attendanceService } from '@/services/attendance.service';
import { Attendance } from '@/types';
import { formatDuration, formatDistance, formatDate } from '@/lib/utils';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

export default function ReportsPage() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const { data: history } = useQuery({
    queryKey: ['attendance-history', period],
    queryFn: () => attendanceService.getHistory({
      limit: '50',
      sortBy: 'checkInTime',
      sortOrder: 'desc',
    }),
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Attendance Reports</h1>
            <p className="text-muted-foreground">View and export attendance data</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Excel
            </Button>
            <Button variant="outline" className="gap-2">
              <FileDown className="h-4 w-4" />
              CSV
            </Button>
            <Button className="gap-2">
              <Download className="h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>

        <Tabs value={period} onValueChange={(v) => setPeriod(v as any)}>
          <TabsList>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>

          <TabsContent value={period} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {period.charAt(0).toUpperCase() + period.slice(1)} Attendance Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Distance</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history?.data?.map((record: Attendance) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                              {record.employee?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </div>
                            <span className="text-sm font-medium">{record.employee?.name}</span>
                          </div>
                        </TableCell>
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
                      </TableRow>
                    ))}
                    {(!history?.data || history.data.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          No attendance records found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
