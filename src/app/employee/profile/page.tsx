'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardLayout } from '@/components/dashboard-layout';
import { employeeService } from '@/services/employee.service';
import { Mail, Shield, Building2, MapPin, Briefcase } from 'lucide-react';

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);

  const { data: employee, isLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => employeeService.getMe(),
    enabled: !!user,
  });

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">Your account and employee information</p>
        </div>

        <Card>
          <CardHeader className="text-center pb-2">
            <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4">
              <span className="text-3xl font-bold text-primary">
                {employee?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <CardTitle className="text-xl">{employee?.name || user?.email}</CardTitle>
            {employee?.employeeId && (
              <p className="text-sm text-muted-foreground">ID: {employee.employeeId}</p>
            )}
            <Badge variant="secondary" className="mt-1">
              {user?.role?.replace('_', ' ')}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{employee?.email || user?.email}</p>
                  </div>
                </div>
                {employee?.phone && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Briefcase className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{employee.phone}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Role</p>
                    <p className="font-medium">{user?.role?.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Company</p>
                    <p className="font-medium">{user?.company?.name || 'N/A'}</p>
                  </div>
                </div>
                {employee?.department && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Department</p>
                      <p className="font-medium">{employee.department.name}</p>
                    </div>
                  </div>
                )}
                {employee?.designation && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Briefcase className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Designation</p>
                      <p className="font-medium">{employee.designation.name}</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
