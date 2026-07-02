'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { Sidebar } from '@/components/sidebar';
import { useAppStore } from '@/store/app';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main
        className={`transition-all duration-300 ${
          sidebarOpen ? 'ml-[260px]' : 'ml-[72px]'
        } min-h-screen`}
      >
        <div className="p-6 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
