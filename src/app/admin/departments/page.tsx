'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { DashboardLayout } from '@/components/dashboard-layout';
import { departmentService } from '@/services/department.service';
import { Department } from '@/types';

export default function DepartmentsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const { data: departments, isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentService.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => departmentService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['departments'] }),
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Departments</h1>
            <p className="text-muted-foreground">Organize your teams</p>
          </div>
          <Button className="gap-2" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4" />
            Add Department
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Departments</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Employees</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments?.map((dept: Department) => (
                    <TableRow key={dept.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{dept.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {dept.description || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{dept._count?.employees || 0}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteMutation.mutate(dept.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
