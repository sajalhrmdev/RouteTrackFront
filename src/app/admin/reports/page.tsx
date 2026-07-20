'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  FileText, Download, CalendarDays, FileSpreadsheet, FileDown, Loader2, AlertCircle,
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

function getPeriodDates(period: 'daily' | 'weekly' | 'monthly') {
  const now = new Date();
  const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const startDate = new Date(endDate);
  if (period === 'daily') {
    startDate.setHours(0, 0, 0, 0);
  } else if (period === 'weekly') {
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);
  } else {
    startDate.setDate(startDate.getDate() - 29);
    startDate.setHours(0, 0, 0, 0);
  }
  return { startDate, endDate };
}

function exportCSV(records: Attendance[]) {
  const headers = ['Employee', 'Date', 'Check In', 'Check Out', 'Duration', 'Distance (km)', 'Status'];
  const rows = records.map((r) => [
    r.employee?.name || '',
    formatDate(r.checkInTime, 'short'),
    r.checkInTime ? formatDate(r.checkInTime, 'time') : '-',
    r.checkOutTime ? formatDate(r.checkOutTime, 'time') : '-',
    r.totalWorkingTime > 0 ? formatDuration(r.totalWorkingTime) : '-',
    r.totalDistance > 0 ? (r.totalDistance / 1000).toFixed(2) : '-',
    r.status === 'CHECKED_IN' ? 'Active' : 'Completed',
  ]);

  const csv = [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `attendance-report-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportExcel(records: Attendance[]) {
  const data = records.map((r) => ({
    Employee: r.employee?.name || '',
    Date: formatDate(r.checkInTime, 'short'),
    'Check In': r.checkInTime ? formatDate(r.checkInTime, 'time') : '-',
    'Check Out': r.checkOutTime ? formatDate(r.checkOutTime, 'time') : '-',
    Duration: r.totalWorkingTime > 0 ? formatDuration(r.totalWorkingTime) : '-',
    'Distance (km)': r.totalDistance > 0 ? (r.totalDistance / 1000).toFixed(2) : '0',
    Status: r.status === 'CHECKED_IN' ? 'Active' : 'Completed',
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
  XLSX.writeFile(wb, `attendance-report-${new Date().toISOString().split('T')[0]}.xlsx`);
}

function exportPDF(records: Attendance[]) {
  const doc = new jsPDF();
  doc.text('Attendance Report', 14, 15);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 22);

  autoTable(doc, {
    head: [[ 'Employee', 'Date', 'Check In', 'Check Out', 'Duration', 'Distance', 'Status' ]],
    body: records.map((r) => [
      r.employee?.name || '',
      formatDate(r.checkInTime, 'short'),
      r.checkInTime ? formatDate(r.checkInTime, 'time') : '-',
      r.checkOutTime ? formatDate(r.checkOutTime, 'time') : '-',
      r.totalWorkingTime > 0 ? formatDuration(r.totalWorkingTime) : '-',
      r.totalDistance > 0 ? formatDistance(r.totalDistance) : '-',
      r.status === 'CHECKED_IN' ? 'Active' : 'Completed',
    ]),
    startY: 28,
  });

  doc.save(`attendance-report-${new Date().toISOString().split('T')[0]}.pdf`);
}

export default function ReportsPage() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const dateRange = useMemo(() => getPeriodDates(period), [period]);

  const { data: history, isLoading, isError, refetch } = useQuery({
    queryKey: ['attendance-history', period],
    queryFn: () => attendanceService.getHistory({
      limit: '200',
      sortBy: 'checkInTime',
      sortOrder: 'desc',
      startDate: dateRange.startDate.toISOString(),
      endDate: dateRange.endDate.toISOString(),
    }),
  });

  const records = history?.data || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Attendance Reports</h1>
            <p className="text-muted-foreground">View and export attendance data</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2" disabled={records.length === 0} onClick={() => exportExcel(records)}>
              <FileSpreadsheet className="h-4 w-4" />
              Excel
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              disabled={records.length === 0}
              onClick={() => exportCSV(records)}
            >
              <FileDown className="h-4 w-4" />
              CSV
            </Button>
            <Button className="gap-2" disabled={records.length === 0} onClick={() => exportPDF(records)}>
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
                  <span className="text-sm font-normal text-muted-foreground">
                    ({dateRange.startDate.toLocaleDateString()} - {dateRange.endDate.toLocaleDateString()})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Loading reports...
                  </div>
                ) : isError ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mb-2 text-red-500" />
                    <p className="text-red-500 mb-2">Failed to load attendance data</p>
                    <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
                  </div>
                ) : records.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="font-medium">No attendance records found</p>
                    <p className="text-sm">No check-ins recorded for this period</p>
                    <CalendarDays className="h-5 w-5 mt-2 opacity-30" />
                  </div>
                ) : (
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
                      {records.map((record: Attendance) => (
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
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
