'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { DashboardLayout } from '@/components/dashboard-layout';
import { designationService } from '@/services/designation.service';
import { Designation } from '@/types';
import { Briefcase, Edit2, Trash2, Plus } from 'lucide-react';

export default function DesignationsPage() {
  const queryClient = useQueryClient();

  const { data: designations, isLoading } = useQuery({
    queryKey: ['designations'],
    queryFn: designationService.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => designationService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['designations'] }),
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Designations</h1>
            <p className="text-muted-foreground">Define roles and positions</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Designation
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Designations</CardTitle>
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
                  {designations?.map((desig: Designation) => (
                    <TableRow key={desig.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{desig.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {desig.description || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{desig._count?.employees || 0}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon"><Edit2 className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(desig.id)}>
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
